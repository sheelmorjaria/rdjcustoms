import User from '../models/User.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import logger from '../utils/logger.js';

// Add product to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if product is already in wishlist
    if (user.isInWishlist(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Product is already in wishlist'
      });
    }

    // Add to wishlist
    user.addToWishlist(productId);
    await user.save();

    // Log the action
    logger.info('Product added to wishlist', {
      userId: user._id,
      productId: productId,
      action: 'add_to_wishlist'
    });

    res.status(201).json({
      success: true,
      message: 'Product added to wishlist successfully',
      data: {
        wishlistCount: user.getWishlistCount()
      }
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add product to wishlist'
    });
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if product is in wishlist
    if (!user.isInWishlist(productId)) {
      return res.status(404).json({
        success: false,
        error: 'Product not found in wishlist'
      });
    }

    // Remove from wishlist
    user.removeFromWishlist(productId);
    await user.save();

    // Log the action
    logger.info('Product removed from wishlist', {
      userId: user._id,
      productId: productId,
      action: 'remove_from_wishlist'
    });

    res.json({
      success: true,
      message: 'Product removed from wishlist successfully',
      data: {
        wishlistCount: user.getWishlistCount()
      }
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove product from wishlist'
    });
  }
};

// Get user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user with populated wishlist
    const user = await User.findById(userId)
      .populate({
        path: 'wishlist',
        select: 'name slug price images shortDescription stockStatus stockQuantity isActive',
        match: { isActive: true } // Only return active products
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Filter out any null products (in case some products were deleted)
    const wishlistProducts = user.wishlist.filter(product => product !== null);

    res.json({
      success: true,
      data: {
        wishlist: wishlistProducts,
        totalItems: wishlistProducts.length
      }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wishlist'
    });
  }
};

// Check if product is in wishlist
export const checkProductInWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const isInWishlist = user.isInWishlist(productId);

    res.json({
      success: true,
      data: {
        isInWishlist: isInWishlist
      }
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check wishlist status'
    });
  }
};

// Clear entire wishlist
export const clearWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Clear wishlist
    user.clearWishlist();
    await user.save();

    // Log the action
    logger.info('Wishlist cleared', {
      userId: user._id,
      action: 'clear_wishlist'
    });

    res.json({
      success: true,
      message: 'Wishlist cleared successfully',
      data: {
        wishlistCount: 0
      }
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear wishlist'
    });
  }
};

// Add product from wishlist to cart
export const addToCartFromWishlist = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const { removeFromWishlistAfterAdd = true } = req.body; // Optional, default true
    const userId = req.user._id;

    // Validate product exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }


    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Product is not available'
      });
    }

    if (!product.isInStock()) {
      return res.status(400).json({
        success: false,
        error: 'Product is out of stock'
      });
    }

    // Check stock quantity if applicable
    if (product.stockQuantity && product.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        error: `Only ${product.stockQuantity} items available in stock`
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if product is in wishlist
    if (!user.isInWishlist(productId)) {
      return res.status(404).json({
        success: false,
        error: 'Product not found in wishlist'
      });
    }

    // Find or create cart for user
    let cart = await Cart.findByUserId(userId);
    if (!cart) {
      cart = new Cart({
        userId: userId,
        items: [],
        totalItems: 0,
        totalAmount: 0
      });
    }

    // Add product to cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId.toString()
    );

    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].subtotal = 
        cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].unitPrice;
    } else {
      // Add new item to cart
      cart.items.push({
        productId: product._id,
        productName: product.name,
        productSlug: product.slug,
        unitPrice: product.price,
        quantity: quantity,
        subtotal: product.price * quantity
      });
    }

    // Recalculate cart totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((total, item) => total + item.subtotal, 0);

    await cart.save();

    // Remove from wishlist if requested
    if (removeFromWishlistAfterAdd) {
      user.removeFromWishlist(productId);
      await user.save();
    }

    // Log the action
    logger.info('Product added to cart from wishlist', {
      userId: user._id,
      productId: productId,
      quantity: quantity,
      removedFromWishlist: removeFromWishlistAfterAdd,
      action: 'add_to_cart_from_wishlist'
    });

    res.json({
      success: true,
      message: 'Product added to cart successfully',
      data: {
        productId: productId,
        quantity: quantity,
        removedFromWishlist: removeFromWishlistAfterAdd,
        wishlistCount: user.getWishlistCount(),
        cartTotalItems: cart.totalItems
      }
    });
  } catch (error) {
    console.error('Add to cart from wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add product to cart from wishlist'
    });
  }
};