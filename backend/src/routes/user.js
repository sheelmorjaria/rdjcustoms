import express from 'express';
import { 
  getAddresses, 
  getAddressById, 
  addAddress, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress, 
  clearDefaultAddress,
  // Legacy compatibility
  getUserAddresses as _getUserAddresses, 
  addUserAddress as _addUserAddress, 
  updateUserAddress as _updateUserAddress, 
  deleteUserAddress as _deleteUserAddress 
} from '../controllers/userAddressController.js';
import { getUserOrders, getUserOrderDetails, placeOrder, cancelOrder, getEligibleReturnItems, getOrderTracking } from '../controllers/userOrderController.js';
import { getUserReturnRequests, getReturnRequestDetails, submitReturnRequest } from '../controllers/userReturnController.js';
import { authenticate } from '../middleware/auth.js';
import wishlistRoutes from './wishlist.js';
import { getReferralDashboard } from '../controllers/referralController.js';
import { handleValidationErrors } from '../middleware/validation.js';
import {
  createAddressValidator,
  updateAddressValidator,
  deleteAddressValidator,
  setDefaultAddressValidator,
  getAddressValidator
} from '../validators/addressValidators.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Address management routes (new comprehensive API)
router.get('/addresses', getAddresses);
router.get('/addresses/:addressId', getAddressValidator, handleValidationErrors, getAddressById);
router.post('/addresses', createAddressValidator, handleValidationErrors, addAddress);
router.put('/addresses/:addressId', updateAddressValidator, handleValidationErrors, updateAddress);
router.delete('/addresses/:addressId', deleteAddressValidator, handleValidationErrors, deleteAddress);
router.put('/addresses/:addressId/default', setDefaultAddressValidator, handleValidationErrors, setDefaultAddress);
router.delete('/addresses/default', clearDefaultAddress);

// Order management routes
router.get('/orders', getUserOrders);
router.get('/orders/:orderId', getUserOrderDetails);
router.get('/orders/:orderId/tracking', getOrderTracking);
router.post('/orders/place-order', placeOrder);
router.post('/orders/:orderId/cancel', cancelOrder);
router.get('/orders/:orderId/eligible-returns', getEligibleReturnItems);

// Return management routes
router.get('/returns', getUserReturnRequests);
router.get('/returns/:returnRequestId', getReturnRequestDetails);
router.post('/returns/request', submitReturnRequest);

// Wishlist management routes
router.use('/wishlist', wishlistRoutes);

// Referral dashboard route (protected)
router.get('/referral/dashboard', getReferralDashboard);

export default router;