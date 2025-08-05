const express = require('express');
const paymentService = require('../services/paymentService');

const router = express.Router();

// GET /api/payments/pricing - Get service pricing
router.get('/pricing', (req, res) => {
  try {
    const pricing = paymentService.getServicePricing();
    
    res.json({
      success: true,
      data: pricing
    });
  } catch (error) {
    console.error('Error getting pricing:', error);
    res.status(500).json({
      error: 'Failed to get pricing',
      message: error.message
    });
  }
});

// POST /api/payments/create-intent - Create payment intent
router.post('/create-intent', async (req, res) => {
  try {
    const { appointment, amount } = req.body;
    
    if (!appointment || !amount) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Appointment and amount are required'
      });
    }

    const result = await paymentService.createPaymentIntent(appointment, amount);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          clientSecret: result.clientSecret,
          paymentIntentId: result.paymentIntentId
        }
      });
    } else {
      res.status(400).json({
        error: 'Payment intent creation failed',
        message: result.error
      });
    }
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      error: 'Failed to create payment intent',
      message: error.message
    });
  }
});

// POST /api/payments/confirm - Confirm payment
router.post('/confirm', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({
        error: 'Missing payment intent ID',
        message: 'Payment intent ID is required'
      });
    }

    const result = await paymentService.confirmPayment(paymentIntentId);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        data: result.paymentIntent
      });
    } else {
      res.status(400).json({
        error: 'Payment confirmation failed',
        message: result.error
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      error: 'Failed to confirm payment',
      message: error.message
    });
  }
});

// POST /api/payments/create-customer - Create Stripe customer
router.post('/create-customer', async (req, res) => {
  try {
    const { userData } = req.body;
    
    if (!userData || !userData.email || !userData.name) {
      return res.status(400).json({
        error: 'Missing user data',
        message: 'User email and name are required'
      });
    }

    const result = await paymentService.createCustomer(userData);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Customer created successfully',
        data: result.customer
      });
    } else {
      res.status(400).json({
        error: 'Customer creation failed',
        message: result.error
      });
    }
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      error: 'Failed to create customer',
      message: error.message
    });
  }
});

// GET /api/payments/payment-methods/:customerId - Get payment methods
router.get('/payment-methods/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const result = await paymentService.getPaymentMethods(customerId);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.paymentMethods
      });
    } else {
      res.status(400).json({
        error: 'Failed to get payment methods',
        message: result.error
      });
    }
  } catch (error) {
    console.error('Error getting payment methods:', error);
    res.status(500).json({
      error: 'Failed to get payment methods',
      message: error.message
    });
  }
});

// POST /api/payments/refund - Create refund
router.post('/refund', async (req, res) => {
  try {
    const { paymentIntentId, amount } = req.body;
    
    if (!paymentIntentId || !amount) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Payment intent ID and amount are required'
      });
    }

    const result = await paymentService.createRefund(paymentIntentId, amount);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Refund created successfully',
        data: result.refund
      });
    } else {
      res.status(400).json({
        error: 'Refund creation failed',
        message: result.error
      });
    }
  } catch (error) {
    console.error('Error creating refund:', error);
    res.status(500).json({
      error: 'Failed to create refund',
      message: error.message
    });
  }
});

// POST /api/payments/calculate-cost - Calculate appointment cost
router.post('/calculate-cost', (req, res) => {
  try {
    const { serviceType, duration = 60 } = req.body;
    
    if (!serviceType) {
      return res.status(400).json({
        error: 'Missing service type',
        message: 'Service type is required'
      });
    }

    const cost = paymentService.calculateAppointmentCost(serviceType, duration);
    
    res.json({
      success: true,
      data: {
        serviceType,
        duration,
        cost
      }
    });
  } catch (error) {
    console.error('Error calculating cost:', error);
    res.status(500).json({
      error: 'Failed to calculate cost',
      message: error.message
    });
  }
});

module.exports = router; 