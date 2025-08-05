const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  constructor() {
    this.stripe = stripe;
  }

  // Create a payment intent for an appointment
  async createPaymentIntent(appointment, amount) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        metadata: {
          appointment_id: appointment.id,
          pet_name: appointment.pet_name,
          service_type: appointment.service_type,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Confirm payment
  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          paymentIntent,
        };
      } else {
        return {
          success: false,
          error: 'Payment not completed',
          status: paymentIntent.status,
        };
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Create a customer
  async createCustomer(userData) {
    try {
      const customer = await this.stripe.customers.create({
        email: userData.email,
        name: userData.name,
        metadata: {
          user_id: userData.id,
        },
      });

      return {
        success: true,
        customer,
      };
    } catch (error) {
      console.error('Error creating customer:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Create a subscription for recurring appointments
  async createSubscription(customerId, priceId) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      return {
        success: true,
        subscription,
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get payment methods for a customer
  async getPaymentMethods(customerId) {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return {
        success: true,
        paymentMethods: paymentMethods.data,
      };
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Create a refund
  async createRefund(paymentIntentId, amount) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount * 100, // Convert to cents
      });

      return {
        success: true,
        refund,
      };
    } catch (error) {
      console.error('Error creating refund:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Calculate appointment cost based on service type
  calculateAppointmentCost(serviceType, duration = 60) {
    const baseRates = {
      'checkup': 75,
      'vaccination': 45,
      'surgery': 300,
      'emergency': 150,
      'grooming': 60,
      'dental': 120,
      'consultation': 50,
    };

    const baseRate = baseRates[serviceType.toLowerCase()] || 75;
    const durationMultiplier = duration / 60; // Convert minutes to hours
    
    return Math.round(baseRate * durationMultiplier);
  }

  // Get service pricing
  getServicePricing() {
    return {
      checkup: {
        name: 'Regular Checkup',
        price: 75,
        duration: 60,
        description: 'Comprehensive health examination',
      },
      vaccination: {
        name: 'Vaccination',
        price: 45,
        duration: 30,
        description: 'Essential vaccinations',
      },
      surgery: {
        name: 'Surgery',
        price: 300,
        duration: 120,
        description: 'Surgical procedures',
      },
      emergency: {
        name: 'Emergency Care',
        price: 150,
        duration: 90,
        description: 'Urgent medical attention',
      },
      grooming: {
        name: 'Grooming',
        price: 60,
        duration: 60,
        description: 'Pet grooming services',
      },
      dental: {
        name: 'Dental Care',
        price: 120,
        duration: 90,
        description: 'Dental cleaning and care',
      },
      consultation: {
        name: 'Consultation',
        price: 50,
        duration: 30,
        description: 'General consultation',
      },
    };
  }
}

module.exports = new PaymentService(); 