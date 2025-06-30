import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Add product to wishlist
 * @param {string} productId - The product ID to add
 * @returns {Promise<Object>} Response data
 */
export const addToWishlist = async (productId) => {
  try {
    const response = await api.post('/user/wishlist', { productId });
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Failed to add product to wishlist';
    throw new Error(message);
  }
};

/**
 * Remove product from wishlist
 * @param {string} productId - The product ID to remove
 * @returns {Promise<Object>} Response data
 */
export const removeFromWishlist = async (productId) => {
  try {
    const response = await api.delete(`/user/wishlist/${productId}`);
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Failed to remove product from wishlist';
    throw new Error(message);
  }
};

/**
 * Get user's wishlist
 * @returns {Promise<Object>} Wishlist data with products
 */
export const getWishlist = async () => {
  try {
    const response = await api.get('/user/wishlist');
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Failed to fetch wishlist';
    throw new Error(message);
  }
};

/**
 * Check if product is in wishlist
 * @param {string} productId - The product ID to check
 * @returns {Promise<Object>} Object with isInWishlist boolean
 */
export const checkProductInWishlist = async (productId) => {
  try {
    const response = await api.get(`/user/wishlist/check/${productId}`);
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Failed to check wishlist status';
    throw new Error(message);
  }
};

/**
 * Clear entire wishlist
 * @returns {Promise<Object>} Response data
 */
export const clearWishlist = async () => {
  try {
    const response = await api.delete('/user/wishlist');
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Failed to clear wishlist';
    throw new Error(message);
  }
};

/**
 * Add product from wishlist to cart
 * @param {string} productId - The product ID to add to cart
 * @param {number} quantity - Quantity to add (default: 1)
 * @param {boolean} removeFromWishlistAfterAdd - Whether to remove from wishlist after adding to cart (default: true)
 * @returns {Promise<Object>} Response data
 */
export const addToCartFromWishlist = async (productId, quantity = 1, removeFromWishlistAfterAdd = true) => {
  try {
    const response = await api.post('/user/wishlist/add-to-cart', {
      productId,
      quantity,
      removeFromWishlistAfterAdd
    });
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Failed to add product to cart from wishlist';
    throw new Error(message);
  }
};

/**
 * Get wishlist count (utility function)
 * @returns {Promise<number>} Number of items in wishlist
 */
export const getWishlistCount = async () => {
  try {
    const wishlistData = await getWishlist();
    return wishlistData.totalItems || 0;
  } catch (error) {
    console.error('Error getting wishlist count:', error);
    return 0;
  }
};