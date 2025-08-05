const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const db = require('../config/database');
const router = express.Router();

// Pricing tiers configuration
const PRICING_TIERS = {
  basic: {
    price: 2900, // $29.00 in cents
    name: 'Basic',
    features: {
      maxPets: 100,
      maxAppointments: 1000,
      maxUsers: 2,
      maxLocations: 1
    }
  },
  professional: {
    price: 7900, // $79.00 in cents
    name: 'Professional',
    features: {
      maxPets: 500,
      maxAppointments: 5000,
      maxUsers: 5,
      maxLocations: 3
    }
  },
  enterprise: {
    price: 19900, // $199.00 in cents
    name: 'Enterprise',
    features: {
      maxPets: -1, // Unlimited
      maxAppointments: -1, // Unlimited
      maxUsers: -1, // Unlimited
      maxLocations: -1 // Unlimited
    }
  }
};

// Create Stripe customer
const createStripeCustomer = async (clinicData) => {
  try {
    const customer = await stripe.customers.create({
      email: clinicData.email,
      name: clinicData.name,
      metadata: {
        clinic_id: clinicData.id
      }
    });
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
};

// Create subscription
router.post('/create-subscription', authenticateToken, async (req, res) => {
  try {
    const { tier, paymentMethodId } = req.body;
    
    if (!PRICING_TIERS[tier]) {
      return res.status(400).json({
        error: 'Invalid tier',
        message: 'Please select a valid subscription tier'
      });
    }

    // Get clinic data
    const clinics = await db.query(
      'SELECT * FROM clinics WHERE id = ?',
      [req.user.clinic_id]
    );

    if (clinics.length === 0) {
      return res.status(404).json({
        error: 'Clinic not found',
        message: 'Clinic not found'
      });
    }

    const clinic = clinics[0];

    // Create or get Stripe customer
    let customer;
    if (clinic.stripe_customer_id) {
      customer = await stripe.customers.retrieve(clinic.stripe_customer_id);
    } else {
      customer = await createStripeCustomer(clinic);
      await db.run(
        'UPDATE clinics SET stripe_customer_id = ? WHERE id = ?',
        [customer.id, clinic.id]
      );
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: `price_${tier}` }], // You'll need to create these in Stripe
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Update clinic subscription
    await db.run(
      `UPDATE clinics SET 
       subscription_tier = ?, 
       subscription_status = 'active',
       stripe_subscription_id = ?,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [tier, subscription.id, clinic.id]
    );

    res.json({
      success: true,
      message: 'Subscription created successfully',
      data: {
        subscriptionId: subscription.id,
        tier: tier,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(500).json({
      error: 'Subscription creation failed',
      message: error.message
    });
  }
});

// Get subscription status
router.get('/subscription', authenticateToken, async (req, res) => {
  try {
    const clinics = await db.query(
      'SELECT subscription_tier, subscription_status, stripe_subscription_id FROM clinics WHERE id = ?',
      [req.user.clinic_id]
    );

    if (clinics.length === 0) {
      return res.status(404).json({
        error: 'Clinic not found',
        message: 'Clinic not found'
      });
    }

    const clinic = clinics[0];
    
    // Get usage statistics
    const petsCount = await db.query(
      'SELECT COUNT(*) as count FROM pets WHERE clinic_id = ?',
      [req.user.clinic_id]
    );

    const appointmentsCount = await db.query(
      'SELECT COUNT(*) as count FROM appointments WHERE clinic_id = ?',
      [req.user.clinic_id]
    );

    const usersCount = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE clinic_id = ?',
      [req.user.clinic_id]
    );

    const tier = clinic.subscription_tier || 'basic';
    const tierConfig = PRICING_TIERS[tier];

    res.json({
      success: true,
      data: {
        tier: tier,
        status: clinic.subscription_status || 'inactive',
        features: tierConfig.features,
        usage: {
          pets: petsCount[0]?.count || 0,
          appointments: appointmentsCount[0]?.count || 0,
          users: usersCount[0]?.count || 0
        },
        limits: tierConfig.features
      }
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({
      error: 'Failed to get subscription status',
      message: error.message
    });
  }
});

// Get pricing tiers
router.get('/pricing', (req, res) => {
  try {
    const pricing = Object.keys(PRICING_TIERS).map(tier => ({
      tier: tier,
      name: PRICING_TIERS[tier].name,
      price: PRICING_TIERS[tier].price / 100, // Convert from cents
      features: PRICING_TIERS[tier].features
    }));

    res.json({
      success: true,
      data: pricing
    });
  } catch (error) {
    console.error('Pricing error:', error);
    res.status(500).json({
      error: 'Failed to get pricing',
      message: error.message
    });
  }
});

// Cancel subscription
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const clinics = await db.query(
      'SELECT stripe_subscription_id FROM clinics WHERE id = ?',
      [req.user.clinic_id]
    );

    if (clinics.length === 0) {
      return res.status(404).json({
        error: 'Clinic not found',
        message: 'Clinic not found'
      });
    }

    const clinic = clinics[0];

    if (!clinic.stripe_subscription_id) {
      return res.status(400).json({
        error: 'No active subscription',
        message: 'No active subscription found'
      });
    }

    // Cancel subscription in Stripe
    await stripe.subscriptions.update(clinic.stripe_subscription_id, {
      cancel_at_period_end: true
    });

    // Update clinic status
    await db.run(
      'UPDATE clinics SET subscription_status = ? WHERE id = ?',
      ['cancelled', req.user.clinic_id]
    );

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    res.status(500).json({
      error: 'Failed to cancel subscription',
      message: error.message
    });
  }
});

// Webhook handler for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      // Update subscription status
      await db.run(
        'UPDATE clinics SET subscription_status = ? WHERE stripe_subscription_id = ?',
        ['active', invoice.subscription]
      );
      break;
    
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      // Update subscription status
      await db.run(
        'UPDATE clinics SET subscription_status = ? WHERE stripe_subscription_id = ?',
        ['suspended', failedInvoice.subscription]
      );
      break;
    
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      // Update subscription status
      await db.run(
        'UPDATE clinics SET subscription_status = ? WHERE stripe_subscription_id = ?',
        ['cancelled', subscription.id]
      );
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router; 