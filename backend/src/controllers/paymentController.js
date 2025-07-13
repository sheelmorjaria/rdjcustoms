import mongoose from 'mongoose';
import { Client, Environment } from '@paypal/paypal-server-sdk';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Promotion from '../models/Promotion.js';
import bitcoinService from '../services/bitcoinService.js';
import moneroService from '../services/moneroService.js';
import { handleOrderCompletion } from '../services/orderCompletionService.js';
import logger, { logError, logPaymentEvent } from '../utils/logger.js';

// Initialize PayPal API
const paypalEnvironment = process.env.PAYPAL_ENVIRONMENT || 'sandbox'; // 'sandbox' or 'live'
const paypalClientId = process.env.PAYPAL_CLIENT_ID;
const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;

let paypalClient = null;
if (paypalClientId && paypalClientSecret) {
  try {
    const environment = paypalEnvironment === 'live' ? Environment.Production : Environment.Sandbox;
    paypalClient = new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: paypalClientId,
        oAuthClientSecret: paypalClientSecret
      },
      environment: environment
    });
  } catch (error) {
    logError(error, { context: 'paypal_client_initialization' });
  }
}

// Helper function to find or create cart
const findOrCreateCart = async (req) => {
  const userId = req.user?._id;
  
  if (userId) {
    // Authenticated user
    let cart = await Cart.findByUserId(userId);
    if (!cart) {
      cart = new Cart({ userId });
      await cart.save();
    }
    return cart;
  } else {
    // Guest user
    const sessionId = req.cookies.cartSessionId;
    if (!sessionId) {
      throw new Error('No cart session found');
    }
    
    const cart = await Cart.findBySessionId(sessionId);
    if (!cart) {
      throw new Error('Cart not found');
    }
    return cart;
  }
};




// Get available payment methods
export const getPaymentMethods = async (req, res) => {
  try {
    // For now, return static payment methods
    // In production, you might want to configure these dynamically
    const paymentMethods = [
      {
        id: 'paypal',
        type: 'paypal',
        name: 'PayPal',
        description: 'Pay with your PayPal account',
        icon: 'paypal',
        enabled: true
      },
      {
        id: 'bitcoin',
        type: 'bitcoin',
        name: 'Bitcoin',
        description: 'Pay with Bitcoin - private and secure',
        icon: 'bitcoin',
        enabled: true
      },
      {
        id: 'monero',
        type: 'monero',
        name: 'Monero',
        description: 'Pay with Monero - private and untraceable',
        icon: 'monero',
        enabled: true
      }
    ];

    res.json({
      success: true,
      data: {
        paymentMethods: paymentMethods.filter(method => method.enabled)
      }
    });

  } catch (error) {
    logError(error, { context: 'paypal_payment_methods' });
    res.status(500).json({
      success: false,
      error: 'Server error occurred while fetching payment methods'
    });
  }
};

// Create PayPal order
export const createPayPalOrder = async (req, res) => {
  try {
    const { shippingAddress, shippingMethodId } = req.body;

    // Validate PayPal client availability
    if (!paypalClient) {
      return res.status(500).json({
        success: false,
        error: 'PayPal payment processing is not available'
      });
    }

    // Validate required fields
    if (!shippingAddress || !shippingMethodId) {
      return res.status(400).json({
        success: false,
        error: 'Shipping address and shipping method are required'
      });
    }

    // Get user's cart
    let cart;
    try {
      cart = await findOrCreateCart(req);
    } catch (cartError) {
      return res.status(400).json({
        success: false,
        error: cartError.message
      });
    }
    
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }

    // Calculate order total
    const productIds = cart.items.map(item => item.productId);
    const products = await Product.find({ 
      _id: { $in: productIds },
      isActive: true 
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        error: 'Some products in cart are no longer available'
      });
    }

    // Create product lookup map and calculate total
    const productMap = new Map();
    products.forEach(product => {
      productMap.set(product._id.toString(), product);
    });

    let cartTotal = 0;
    const cartItems = [];

    for (const cartItem of cart.items) {
      const product = productMap.get(cartItem.productId.toString());
      
      if (!product) {
        return res.status(400).json({
          success: false,
          error: `Product ${cartItem.productId} not found`
        });
      }

      if (product.stockQuantity < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for product ${product.name}`
        });
      }

      const itemTotal = product.price * cartItem.quantity;
      cartTotal += itemTotal;

      cartItems.push({
        productId: product._id,
        name: product.name,
        quantity: cartItem.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal
      });
    }

    // Calculate shipping cost
    const ShippingMethod = (await import('../models/ShippingMethod.js')).default;
    const shippingMethod = await ShippingMethod.findOne({ 
      _id: shippingMethodId, 
      isActive: true 
    });

    if (!shippingMethod) {
      return res.status(400).json({
        success: false,
        error: 'Invalid shipping method'
      });
    }

    const calculation = shippingMethod.calculateCost({ items: cartItems, totalValue: cartTotal }, shippingAddress);
    if (calculation === null) {
      return res.status(400).json({
        success: false,
        error: 'Shipping method not available for this cart and address'
      });
    }

    let shippingCost = calculation.cost;
    let discountAmount = 0;
    let appliedPromotion = null;

    // Apply promotion discount if cart has a promotion code
    if (cart.promotionCode && cart.promotionId) {
      try {
        const promotion = await Promotion.findById(cart.promotionId);
        if (promotion && promotion.isValid) {
          // Validate user can still use this promotion
          const userId = req.user?._id;
          if (!userId || promotion.canUserUse(userId)) {
            // Calculate discount
            switch (promotion.type) {
            case 'percentage':
              discountAmount = Math.round(cartTotal * (promotion.value / 100) * 100) / 100;
              break;
            case 'fixed_amount':
              discountAmount = Math.min(promotion.value, cartTotal);
              break;
            case 'free_shipping':
              shippingCost = 0;
              discountAmount = calculation.cost;
              break;
            }
            appliedPromotion = promotion;
          }
        }
      } catch (promotionError) {
        console.error('Error applying promotion:', promotionError);
        // Continue without promotion if there's an error
      }
    }

    const orderTotal = cartTotal + shippingCost - discountAmount;

    // Create PayPal order request
    const orderRequest = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'GBP',
          value: orderTotal.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: 'GBP',
              value: cartTotal.toFixed(2)
            },
            shipping: {
              currency_code: 'GBP',
              value: shippingCost.toFixed(2)
            }
          }
        },
        items: cartItems.map(item => ({
          name: item.name,
          unit_amount: {
            currency_code: 'GBP',
            value: item.unitPrice.toFixed(2)
          },
          quantity: item.quantity.toString()
        })),
        shipping: {
          name: {
            full_name: `${shippingAddress.firstName} ${shippingAddress.lastName}`
          },
          address: {
            address_line_1: shippingAddress.addressLine1,
            address_line_2: shippingAddress.addressLine2 || '',
            admin_area_2: shippingAddress.city,
            admin_area_1: shippingAddress.stateProvince,
            postal_code: shippingAddress.postalCode,
            country_code: shippingAddress.country === 'UK' ? 'GB' : shippingAddress.country
          }
        }
      }],
      application_context: {
        brand_name: 'RDJCustoms',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/success`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout`
      }
    };

    // Create PayPal order
    let paypalOrder;
    try {
      const ordersController = paypalClient.ordersController;
      paypalOrder = await ordersController.ordersCreate({
        body: orderRequest
      });
    } catch (paypalError) {
      // Handle PayPal API specific errors
      logError(paypalError, { context: 'paypal_api_error', orderRequest });
      return res.status(503).json({
        success: false,
        error: 'PayPal service is temporarily unavailable. Please try again later or use an alternative payment method.',
        alternatives: ['bitcoin', 'monero']
      });
    }

    res.json({
      success: true,
      data: {
        paypalOrderId: paypalOrder.result.id,
        orderSummary: {
          cartTotal: cartTotal,
          shippingCost: shippingCost,
          discountAmount: discountAmount,
          orderTotal: orderTotal,
          currency: 'GBP',
          items: cartItems,
          shippingMethod: {
            id: shippingMethod._id,
            name: shippingMethod.name,
            cost: shippingCost
          },
          shippingAddress: shippingAddress,
          promotion: appliedPromotion ? {
            code: appliedPromotion.code,
            name: appliedPromotion.name,
            type: appliedPromotion.type,
            discountAmount: discountAmount
          } : null
        },
        approvalUrl: paypalOrder.result.links.find(link => link.rel === 'approve')?.href
      }
    });

  } catch (error) {
    logError(error, { context: 'paypal_order_creation', cartId: req.body.cartId });
    res.status(500).json({
      success: false,
      error: 'Server error occurred while creating PayPal order'
    });
  }
};

// Capture PayPal payment
export const capturePayPalPayment = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const { paypalOrderId, payerId } = req.body;

    if (!paypalOrderId) {
      return res.status(400).json({
        success: false,
        error: 'PayPal order ID is required'
      });
    }

    if (!paypalClient) {
      return res.status(500).json({
        success: false,
        error: 'PayPal payment processing is not available'
      });
    }

    // Capture the PayPal payment
    const ordersController = paypalClient.ordersController;
    const captureResponse = await ordersController.ordersCapture({
      id: paypalOrderId
    });

    if (captureResponse.result.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: 'PayPal payment capture failed'
      });
    }

    // Extract payment details
    const paymentDetails = captureResponse.result;
    const purchaseUnit = paymentDetails.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];

    if (!capture) {
      return res.status(400).json({
        success: false,
        error: 'PayPal payment capture information not found'
      });
    }

    await session.withTransaction(async () => {
      // Get user's cart to create order
      let cart;
      try {
        cart = await findOrCreateCart(req);
      } catch (cartError) {
        throw new Error(cartError.message);
      }
      
      if (!cart || !cart.items || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      // Get shipping info from PayPal response or cart metadata
      // Note: In a real implementation, you'd store this info when creating the PayPal order
      const shippingInfo = purchaseUnit?.shipping || {};
      
      // Create order in database
      const orderData = {
        userId: req.user?._id || cart.userId,
        customerEmail: req.user?.email || paymentDetails.payer?.email_address,
        items: cart.items.map(item => ({
          productId: item.productId,
          productName: item.productName || 'Product',
          productSlug: item.productSlug || 'product',
          quantity: item.quantity,
          unitPrice: item.unitPrice || item.price,
          totalPrice: (item.unitPrice || item.price) * item.quantity
        })),
        subtotal: parseFloat(purchaseUnit.amount.breakdown?.item_total?.value || 0),
        shipping: parseFloat(purchaseUnit.amount.breakdown?.shipping?.value || 0),
        tax: parseFloat(purchaseUnit.amount.breakdown?.tax_total?.value || 0),
        totalAmount: parseFloat(purchaseUnit.amount.value),
        promotionCode: cart.promotionCode,
        promotionId: cart.promotionId,
        discountAmount: parseFloat(purchaseUnit.amount.breakdown?.discount?.value || 0),
        paymentMethod: {
          type: 'paypal',
          name: 'PayPal'
        },
        paymentDetails: {
          paypalOrderId: paypalOrderId,
          paypalPaymentId: capture.id,
          paypalPayerId: payerId,
          paypalTransactionId: capture.id,
          paypalPayerEmail: paymentDetails.payer?.email_address,
          transactionId: capture.id
        },
        paymentStatus: 'completed',
        status: 'processing',
        shippingAddress: {
          fullName: shippingInfo.name?.full_name || `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || 'Customer',
          addressLine1: shippingInfo.address?.address_line_1 || 'Address Line 1',
          addressLine2: shippingInfo.address?.address_line_2 || '',
          city: shippingInfo.address?.admin_area_2 || 'City',
          stateProvince: shippingInfo.address?.admin_area_1 || 'State',
          postalCode: shippingInfo.address?.postal_code || '00000',
          country: shippingInfo.address?.country_code || 'GB',
          phoneNumber: req.user?.phone || ''
        },
        billingAddress: {
          fullName: shippingInfo.name?.full_name || `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || 'Customer',
          addressLine1: shippingInfo.address?.address_line_1 || 'Address Line 1',
          addressLine2: shippingInfo.address?.address_line_2 || '',
          city: shippingInfo.address?.admin_area_2 || 'City',
          stateProvince: shippingInfo.address?.admin_area_1 || 'State',
          postalCode: shippingInfo.address?.postal_code || '00000',
          country: shippingInfo.address?.country_code || 'GB',
          phoneNumber: req.user?.phone || ''
        },
        shippingMethod: {
          id: new mongoose.Types.ObjectId(), // Default shipping method
          name: 'Standard Shipping',
          cost: parseFloat(purchaseUnit.amount.breakdown?.shipping?.value || 0)
        }
      };


      const order = new Order(orderData);
      
      // Generate order number
      const orderCount = await Order.countDocuments({});
      order.orderNumber = `ORD${Date.now()}${(orderCount + 1).toString().padStart(4, '0')}`;
      
      await order.save({ session });

      // Process order completion (referrals, etc.)
      setImmediate(() => handleOrderCompletion(order, session));

      // Record promotion usage if applicable
      if (cart.promotionId && req.user?._id) {
        try {
          const promotion = await Promotion.findById(cart.promotionId);
          if (promotion) {
            await promotion.recordUsage(req.user._id);
          }
        } catch (promotionError) {
          console.error('Error recording promotion usage:', promotionError);
          // Don't fail the order if promotion recording fails
        }
      }

      // Clear the cart after successful order creation
      await cart.clearCart({ session });

      return order;
    });

    // Fetch the created order for response
    const newOrder = await Order.findOne({ 
      'paymentDetails.paypalOrderId': paypalOrderId 
    }).lean();

    res.json({
      success: true,
      data: {
        orderId: newOrder?._id,
        orderNumber: newOrder?.orderNumber,
        amount: parseFloat(purchaseUnit.amount.value),
        paymentMethod: 'paypal',
        paymentDetails: captureResponse.result,
        status: 'captured'
      }
    });

  } catch (error) {
    logError(error, { context: 'paypal_payment_capture', orderId: req.params.orderId });
    res.status(500).json({
      success: false,
      error: error.message || 'Server error occurred while capturing PayPal payment'
    });
  } finally {
    await session.endSession();
  }
};

// PayPal webhook handler
export const handlePayPalWebhook = async (req, res) => {
  try {
    const webhookEvent = req.body;
    const eventType = webhookEvent.event_type;

    logPaymentEvent('paypal_webhook_received', { eventType });

    switch (eventType) {
    case 'PAYMENT.CAPTURE.COMPLETED':
      await handlePaymentCaptureCompleted(webhookEvent);
      break;
      
    case 'PAYMENT.CAPTURE.DENIED':
      await handlePaymentCaptureDenied(webhookEvent);
      break;
      
    case 'CHECKOUT.ORDER.APPROVED':
      await handleOrderApproved(webhookEvent);
      break;
      
    default:
      logger.warn(`Unhandled PayPal webhook event: ${eventType}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logError(error, { context: 'paypal_webhook_processing' });
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Helper functions for PayPal webhook events
const handlePaymentCaptureCompleted = async (webhookEvent) => {
  try {
    const resource = webhookEvent.resource;
    const orderId = resource.supplementary_data?.related_ids?.order_id;
    
    logPaymentEvent('paypal_payment_captured', { orderId });
    
    // TODO: Update order status in database
    // This will be implemented when we have Order model updates
    
  } catch (error) {
    logError(error, { context: 'paypal_capture_completed_handler', orderId });
  }
};

const handlePaymentCaptureDenied = async (webhookEvent) => {
  try {
    const resource = webhookEvent.resource;
    const orderId = resource.supplementary_data?.related_ids?.order_id;
    
    logPaymentEvent('paypal_payment_denied', { orderId });
    
    // TODO: Update order status in database
    
  } catch (error) {
    logError(error, { context: 'paypal_capture_denied_handler', orderId });
  }
};

const handleOrderApproved = async (webhookEvent) => {
  try {
    const resource = webhookEvent.resource;
    const orderId = resource.id;
    
    logPaymentEvent('paypal_order_approved', { orderId });
    
    // TODO: Update order status in database
    
  } catch (error) {
    logError(error, { context: 'paypal_order_approved_handler', orderId });
  }
};

// Bitcoin payment endpoints

// Initialize Bitcoin payment
export const initializeBitcoinPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required'
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if order is in correct state for Bitcoin payment
    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Order is not in pending payment state'
      });
    }

    // Create Bitcoin payment data
    const bitcoinPaymentData = await bitcoinService.createBitcoinPayment(order.totalAmount);

    // Update order with Bitcoin payment details
    order.paymentMethod = {
      type: 'bitcoin',
      name: 'Bitcoin'
    };
    
    Object.assign(order.paymentDetails, bitcoinPaymentData);
    order.paymentStatus = 'awaiting_confirmation';
    
    await order.save();

    logPaymentEvent('bitcoin_payment_initialized', { orderId,
      address: bitcoinPaymentData.bitcoinAddress,
      amount: bitcoinPaymentData.bitcoinAmount,
      expiry: bitcoinPaymentData.bitcoinPaymentExpiry
    });

    res.json({
      success: true,
      data: {
        bitcoinAddress: bitcoinPaymentData.bitcoinAddress,
        bitcoinAmount: bitcoinPaymentData.bitcoinAmount,
        exchangeRate: bitcoinPaymentData.bitcoinExchangeRate,
        exchangeRateTimestamp: bitcoinPaymentData.bitcoinExchangeRateTimestamp,
        paymentExpiry: bitcoinPaymentData.bitcoinPaymentExpiry,
        orderTotal: order.totalAmount,
        currency: 'GBP'
      }
    });

  } catch (error) {
    logError(error, { context: 'bitcoin_payment_initialization', cartId: req.body.cartId });
    res.status(500).json({
      success: false,
      error: 'Failed to initialize Bitcoin payment'
    });
  }
};

// Get Bitcoin payment status
export const getBitcoinPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (order.paymentMethod.type !== 'bitcoin') {
      return res.status(400).json({
        success: false,
        error: 'Order is not a Bitcoin payment'
      });
    }

    const {
      bitcoinAddress,
      bitcoinAmount,
      bitcoinExchangeRate,
      bitcoinConfirmations,
      bitcoinAmountReceived,
      bitcoinTransactionHash,
      bitcoinPaymentExpiry
    } = order.paymentDetails;

    // Check if payment is expired
    const isExpired = bitcoinService.isPaymentExpired(bitcoinPaymentExpiry);
    if (isExpired && order.paymentStatus === 'awaiting_confirmation') {
      order.paymentStatus = 'expired';
      await order.save();
    }

    res.json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        bitcoinAddress,
        bitcoinAmount,
        bitcoinAmountReceived: bitcoinAmountReceived || 0,
        bitcoinConfirmations: bitcoinConfirmations || 0,
        bitcoinTransactionHash,
        exchangeRate: bitcoinExchangeRate,
        paymentExpiry: bitcoinPaymentExpiry,
        isExpired,
        isConfirmed: bitcoinService.isPaymentConfirmed(bitcoinConfirmations || 0),
        requiresConfirmations: 2
      }
    });

  } catch (error) {
    logError(error, { context: 'bitcoin_payment_status', orderId: req.params.orderId });
    res.status(500).json({
      success: false,
      error: 'Failed to get Bitcoin payment status'
    });
  }
};

// Blockonomics webhook handler
export const handleBlockonomicsWebhook = async (req, res) => {
  try {
    const { addr, value, txid, confirmations } = req.body;

    logPaymentEvent('blockonomics_webhook_received', {
      address: addr,
      value,
      txid,
      confirmations
    });

    if (!addr || !txid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook data'
      });
    }

    // Find order by Bitcoin address
    const order = await Order.findOne({
      'paymentDetails.bitcoinAddress': addr,
      'paymentMethod.type': 'bitcoin'
    });

    if (!order) {
      logger.warn(`No order found for Bitcoin address: ${addr}`);
      return res.status(404).json({
        success: false,
        error: 'Order not found for this Bitcoin address'
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Convert satoshis to BTC
      const amountReceived = bitcoinService.satoshisToBtc(value);
      const expectedAmount = order.paymentDetails.bitcoinAmount;

      // Update payment details
      order.paymentDetails.bitcoinAmountReceived = amountReceived;
      order.paymentDetails.bitcoinConfirmations = confirmations || 0;
      order.paymentDetails.bitcoinTransactionHash = txid;

      // Check if payment is expired
      if (bitcoinService.isPaymentExpired(order.paymentDetails.bitcoinPaymentExpiry)) {
        order.paymentStatus = 'expired';
        logPaymentEvent('bitcoin_payment_expired', { orderId: order._id });
      }
      // Check if payment is sufficient
      else if (!bitcoinService.isPaymentSufficient(amountReceived, expectedAmount)) {
        order.paymentStatus = 'underpaid';
        logPaymentEvent('bitcoin_payment_underpaid', { orderId: order._id, received: amountReceived, expected: expectedAmount });
      }
      // Check if payment is confirmed (2+ confirmations)
      else if (bitcoinService.isPaymentConfirmed(confirmations || 0)) {
        order.paymentStatus = 'completed';
        order.status = 'processing'; // Move order to processing
        logPaymentEvent('bitcoin_payment_confirmed', { orderId: order._id, confirmations });
        
        // Process order completion (referrals, etc.)
        setImmediate(() => handleOrderCompletion(order, session));
      }
      // Payment received but not yet confirmed
      else {
        order.paymentStatus = 'awaiting_confirmation';
        logPaymentEvent('bitcoin_payment_pending', { orderId: order._id, confirmations, required: 2 });
      }

      await order.save({ session });
      await session.commitTransaction();

      logPaymentEvent('bitcoin_payment_updated', { orderId: order._id,
        status: order.paymentStatus,
        confirmations: confirmations,
        amountReceived
      });

      res.status(200).json({ 
        success: true,
        received: true 
      });

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }

  } catch (error) {
    logError(error, { context: 'blockonomics_webhook_processing' });
    res.status(500).json({
      success: false,
      error: 'Webhook processing failed'
    });
  }
};

// Create Monero payment
export const createMoneroPayment = async (req, res) => {
  let session = null;
  let useTransaction = false;
  
  try {
    // Try to start session for transaction support (production with replica sets)
    try {
      session = await mongoose.startSession();
      useTransaction = true;
    } catch (sessionError) {
      // Session not supported (standalone MongoDB or test environment)
      console.log('MongoDB sessions not available, continuing without transactions');
      useTransaction = false;
    }
    
    const { orderId, shippingAddress, billingAddress, shippingMethodId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required'
      });
    }

    // Validate orderId format if not 'new'
    if (orderId !== 'new' && !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID format'
      });
    }

    // Execute main logic with or without transactions
    const executeMainLogic = async () => {
      // Get user's cart to create order if orderId is 'new'
      let order;
      
      if (orderId === 'new') {
        // Create new order from cart
        let cart;
        try {
          cart = await findOrCreateCart(req);
        } catch (cartError) {
          throw new Error(cartError.message);
        }
        
        if (!cart || !cart.items || cart.items.length === 0) {
          throw new Error('Cart is empty');
        }

        // Calculate totals
        const subtotal = cart.totalAmount;

        // Calculate shipping cost (simplified)
        const shippingCost = 10.00; // Default shipping cost
        const totalAmount = subtotal + shippingCost;

        // Get Monero exchange rate and calculate XMR amount
        const { xmrAmount, exchangeRate, validUntil } = await moneroService.convertGbpToXmr(totalAmount);

        // Create order data
        const orderData = {
          userId: req.user?._id || cart.userId,
          customerEmail: req.user?.email || req.body.customerEmail,
          items: cart.items.map(item => ({
            productId: item.productId,
            productName: item.productName || 'Product',
            productSlug: item.productSlug || 'product',
            quantity: item.quantity,
            unitPrice: item.unitPrice || item.price,
            totalPrice: (item.unitPrice || item.price) * item.quantity
          })),
          subtotal: subtotal,
          shipping: shippingCost,
          tax: 0,
          totalAmount: totalAmount,
          paymentMethod: {
            type: 'monero',
            name: 'Monero (XMR)'
          },
          paymentDetails: {
            xmrAmount: xmrAmount,
            exchangeRate: exchangeRate,
            exchangeRateValidUntil: validUntil,
            paymentWindow: moneroService.getPaymentWindowHours(),
            requiredConfirmations: moneroService.getRequiredConfirmations()
          },
          paymentStatus: 'pending',
          status: 'pending',
          shippingAddress: shippingAddress || {},
          billingAddress: billingAddress || {},
          shippingMethod: {
            id: shippingMethodId || new mongoose.Types.ObjectId(),
            name: 'Standard Shipping',
            cost: shippingCost
          }
        };


        order = new Order(orderData);
        
        // Generate order number
        const orderCount = await Order.countDocuments({});
        order.orderNumber = `ORD${Date.now()}${(orderCount + 1).toString().padStart(4, '0')}`;
        
        // Save with session if available, otherwise without
        if (useTransaction && session) {
          await order.save({ session });
        } else {
          await order.save();
        }

        // Clear the cart after successful order creation
        cart.clearCart();
        if (useTransaction && session) {
          await cart.save({ session });
        } else {
          await cart.save();
        }
      } else {
        // Get existing order
        order = await Order.findById(orderId);
        if (!order) {
          throw new Error('Order not found');
        }

        // Recalculate XMR amount with current rate if needed
        const { xmrAmount, exchangeRate, validUntil } = await moneroService.convertGbpToXmr(order.totalAmount);
        
        // Update payment details
        order.paymentDetails = {
          ...order.paymentDetails,
          xmrAmount: xmrAmount,
          exchangeRate: exchangeRate,
          exchangeRateValidUntil: validUntil
        };
        
        // Save with session if available, otherwise without
        if (useTransaction && session) {
          await order.save({ session });
        } else {
          await order.save();
        }
      }

      // Create Monero payment request via GloBee
      const paymentRequest = await moneroService.createPaymentRequest({
        orderId: order._id.toString(),
        amount: order.paymentDetails.xmrAmount,
        currency: 'XMR',
        customerEmail: order.customerEmail
      });

      // Update order with GloBee payment details
      order.paymentDetails = {
        ...order.paymentDetails,
        globeePaymentId: paymentRequest.paymentId,
        moneroAddress: paymentRequest.address,
        paymentUrl: paymentRequest.paymentUrl,
        expirationTime: paymentRequest.expirationTime
      };
      
      // Save with session if available, otherwise without
      if (useTransaction && session) {
        await order.save({ session });
      } else {
        await order.save();
      }

      return order;
    };

    // Execute main logic with or without transaction
    let order;
    if (useTransaction && session) {
      try {
        order = await session.withTransaction(executeMainLogic);
      } catch (transactionError) {
        // If transaction fails (e.g., standalone MongoDB), fallback to non-transaction
        if (transactionError.message?.includes('Transaction') || transactionError.message?.includes('replica set')) {
          console.log('Transaction not supported, executing without transaction');
          order = await executeMainLogic();
        } else {
          throw transactionError;
        }
      }
    } else {
      order = await executeMainLogic();
    }

    // Fetch the created/updated order for response
    const finalOrder = await Order.findById(order._id).lean();

    res.json({
      success: true,
      data: {
        orderId: finalOrder._id,
        orderNumber: finalOrder.orderNumber,
        moneroAddress: finalOrder.paymentDetails.moneroAddress,
        xmrAmount: finalOrder.paymentDetails.xmrAmount,
        exchangeRate: finalOrder.paymentDetails.exchangeRate,
        validUntil: finalOrder.paymentDetails.exchangeRateValidUntil,
        paymentUrl: finalOrder.paymentDetails.paymentUrl,
        expirationTime: finalOrder.paymentDetails.expirationTime,
        requiredConfirmations: finalOrder.paymentDetails.requiredConfirmations,
        paymentWindowHours: finalOrder.paymentDetails.paymentWindow
      }
    });

  } catch (error) {
    logError(error, { context: 'monero_payment_creation', cartId: req.body.cartId });
    
    // Handle specific error cases
    if (error.message === 'Order not found') {
      res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    } else if (error.message === 'Cart is empty') {
      res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Server error occurred while creating Monero payment'
      });
    }
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

// Check Monero payment status
export const checkMoneroPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (order.paymentMethod.type !== 'monero') {
      return res.status(400).json({
        success: false,
        error: 'Order is not a Monero payment'
      });
    }

    // Check if we have a GloBee payment ID
    if (!order.paymentDetails.globeePaymentId) {
      return res.status(400).json({
        success: false,
        error: 'No Monero payment request found'
      });
    }

    // Get current status from GloBee
    const paymentStatus = await moneroService.getPaymentStatus(order.paymentDetails.globeePaymentId);

    res.json({
      success: true,
      data: {
        orderId: order._id,
        paymentStatus: paymentStatus.status,
        confirmations: paymentStatus.confirmations,
        paidAmount: paymentStatus.paid_amount,
        transactionHash: paymentStatus.transaction_hash,
        isExpired: order.paymentDetails.expirationTime ? new Date() > new Date(order.paymentDetails.expirationTime) : false,
        requiredConfirmations: moneroService.getRequiredConfirmations()
      }
    });

  } catch (error) {
    logError(error, { context: 'monero_payment_status', orderId: req.params.orderId });
    res.status(500).json({
      success: false,
      error: 'Server error occurred while checking payment status'
    });
  }
};

// GloBee webhook handler for Monero payments
export const handleMoneroWebhook = async (req, res) => {
  let session = null;
  let useTransaction = false;
  
  try {
    // Try to start session for transaction support
    try {
      session = await mongoose.startSession();
      useTransaction = true;
    } catch (sessionError) {
      console.log('MongoDB sessions not available, continuing without transactions');
      useTransaction = false;
    }

    const signature = req.headers['x-globee-signature'];
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    if (!moneroService.verifyWebhookSignature(payload, signature)) {
      logger.warn('Invalid GloBee webhook signature');
      return res.status(401).json({
        success: false,
        error: 'Invalid webhook signature'
      });
    }

    logPaymentEvent('globee_webhook_received', req.body);

    const webhookData = moneroService.processWebhookNotification(req.body);
    
    if (!webhookData.orderId) {
      logger.warn('No order ID in GloBee webhook');
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook data'
      });
    }

    // Execute main logic with or without transaction
    const executeWebhookLogic = async () => {
      const order = await Order.findById(webhookData.orderId);
      
      if (!order) {
        throw new Error(`Order ${webhookData.orderId} not found`);
      }

      // Update payment details
      order.paymentDetails = {
        ...(order.paymentDetails || {}),
        confirmations: webhookData.confirmations,
        paidAmount: webhookData.paidAmount,
        transactionHash: webhookData.transactionHash,
        lastWebhookUpdate: new Date()
      };

      // Update payment status based on webhook data
      if (webhookData.status === 'confirmed') {
        order.paymentStatus = 'completed';
        logPaymentEvent('monero_payment_confirmed', { orderId: order._id, confirmations: webhookData.confirmations });
        
        // Process order completion (referrals, etc.)
        setImmediate(() => handleOrderCompletion(order));
      } else if (webhookData.status === 'partially_confirmed') {
        order.paymentStatus = 'awaiting_confirmation';
        logPaymentEvent('monero_payment_partial', { orderId: order._id, confirmations: webhookData.confirmations, required: moneroService.getRequiredConfirmations() });
      } else if (webhookData.status === 'underpaid') {
        order.paymentStatus = 'underpaid';
        logPaymentEvent('monero_payment_underpaid', { orderId: order._id, received: webhookData.paidAmount, expected: webhookData.totalAmount });
      } else if (webhookData.status === 'failed') {
        order.paymentStatus = 'failed';
        logPaymentEvent('monero_payment_failed', { orderId: order._id });
      }

      await order.save();

      logPaymentEvent('monero_payment_updated', { orderId: order._id,
        status: order.paymentStatus,
        confirmations: webhookData.confirmations,
        paidAmount: webhookData.paidAmount
      });

      return order;
    };

    if (useTransaction && session) {
      try {
        await session.withTransaction(executeWebhookLogic);
      } catch (transactionError) {
        if (transactionError.message?.includes('Transaction') || transactionError.message?.includes('replica set')) {
          console.log('Transaction not supported, executing without transaction');
          await executeWebhookLogic();
        } else {
          throw transactionError;
        }
      }
    } else {
      await executeWebhookLogic();
    }

    res.status(200).json({ 
      success: true,
      received: true 
    });

  } catch (error) {
    // No need to abort transaction - withTransaction handles it automatically
    logError(error, { context: 'globee_webhook_processing' });
    console.error('Webhook processing error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Webhook processing failed'
    });
  } finally {
    if (session) {
      try {
        await session.endSession();
      } catch (endError) {
        console.log('Failed to end session:', endError.message);
      }
    }
  }
};

// Apply promotion code to cart
export const applyPromotionCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Promotion code is required'
      });
    }

    // Get user's cart
    let cart;
    try {
      cart = await findOrCreateCart(req);
    } catch (cartError) {
      return res.status(400).json({
        success: false,
        error: cartError.message
      });
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }

    // Find promotion by code
    const promotion = await Promotion.findByCode(code);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'Invalid promotion code'
      });
    }

    // Check if promotion is valid
    if (!promotion.isValid) {
      if (promotion.status === 'expired' || promotion.endDate < new Date()) {
        return res.status(400).json({
          success: false,
          error: 'This promotion has expired'
        });
      }
      if (promotion.status === 'inactive') {
        return res.status(400).json({
          success: false,
          error: 'This promotion is not currently active'
        });
      }
      if (promotion.startDate > new Date()) {
        return res.status(400).json({
          success: false,
          error: 'This promotion is not yet active'
        });
      }
      return res.status(400).json({
        success: false,
        error: 'This promotion is not valid'
      });
    }

    // Check if promotion has reached total usage limit
    if (promotion.hasReachedLimit) {
      return res.status(400).json({
        success: false,
        error: 'This promotion has reached its usage limit'
      });
    }

    // Check if user can use this promotion
    const userId = req.user?._id;
    if (userId && !promotion.canUserUse(userId)) {
      return res.status(400).json({
        success: false,
        error: 'You have already used this promotion the maximum number of times'
      });
    }

    // Calculate cart subtotal to check minimum order requirement
    const productIds = cart.items.map(item => item.productId);
    const products = await Product.find({ 
      _id: { $in: productIds },
      isActive: true 
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        error: 'Some products in cart are no longer available'
      });
    }

    // Create product lookup map and calculate subtotal
    const productMap = new Map();
    products.forEach(product => {
      productMap.set(product._id.toString(), product);
    });

    let subtotal = 0;
    let applicableAmount = 0;

    cart.items.forEach(cartItem => {
      const product = productMap.get(cartItem.productId.toString());
      if (product) {
        const itemTotal = product.price * cartItem.quantity;
        subtotal += itemTotal;

        // Check if this item is eligible for the promotion
        let isEligible = true;

        // Check applicable products
        if (promotion.applicableProducts && promotion.applicableProducts.length > 0) {
          isEligible = promotion.applicableProducts.some(
            productId => productId.toString() === product._id.toString()
          );
        }

        // Check applicable categories
        if (isEligible && promotion.applicableCategories && promotion.applicableCategories.length > 0) {
          isEligible = promotion.applicableCategories.some(
            categoryId => categoryId.toString() === product.category.toString()
          );
        }

        if (isEligible) {
          applicableAmount += itemTotal;
        }
      }
    });

    // Check minimum order subtotal
    if (subtotal < promotion.minimumOrderSubtotal) {
      return res.status(400).json({
        success: false,
        error: `Minimum order subtotal of £${promotion.minimumOrderSubtotal.toFixed(2)} required for this promotion`
      });
    }

    // If no products are eligible for the promotion
    if (applicableAmount === 0 && promotion.type !== 'free_shipping') {
      return res.status(400).json({
        success: false,
        error: 'No items in your cart are eligible for this promotion'
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    switch (promotion.type) {
    case 'percentage':
      discountAmount = Math.round(applicableAmount * (promotion.value / 100) * 100) / 100;
      break;
    case 'fixed_amount':
      discountAmount = Math.min(promotion.value, applicableAmount);
      break;
    case 'free_shipping':
      // For free shipping, we'll store the promotion but calculate discount during checkout
      discountAmount = 0;
      break;
    }

    // Store promotion code in cart
    cart.promotionCode = promotion.code;
    cart.promotionId = promotion._id;
    await cart.save();

    res.json({
      success: true,
      message: 'Promotion code applied successfully',
      data: {
        promotionCode: promotion.code,
        promotionName: promotion.name,
        promotionType: promotion.type,
        discountValue: promotion.value,
        discountAmount: discountAmount,
        subtotal: subtotal,
        applicableAmount: applicableAmount,
        isFreeShipping: promotion.type === 'free_shipping'
      }
    });

  } catch (error) {
    console.error('Apply promotion code error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to apply promotion code'
    });
  }
};

// Remove promotion code from cart
export const removePromotionCode = async (req, res) => {
  try {
    // Get user's cart
    let cart;
    try {
      cart = await findOrCreateCart(req);
    } catch (cartError) {
      return res.status(400).json({
        success: false,
        error: cartError.message
      });
    }

    if (!cart) {
      return res.status(400).json({
        success: false,
        error: 'Cart not found'
      });
    }

    // Remove promotion from cart
    cart.promotionCode = undefined;
    cart.promotionId = undefined;
    await cart.save();

    res.json({
      success: true,
      message: 'Promotion code removed successfully'
    });

  } catch (error) {
    console.error('Remove promotion code error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove promotion code'
    });
  }
};

// Export aliases for test compatibility (these functions are already exported above)
// export { createBitcoinPayment as initializeBitcoinPayment };
// export { checkBitcoinPaymentStatus as getBitcoinPaymentStatus };
// export { handleBitcoinWebhook as handleBlockonomicsWebhook };