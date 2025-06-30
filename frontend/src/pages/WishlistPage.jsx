import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';
import { getWishlist, removeFromWishlist, addToCartFromWishlist } from '../services/wishlistService';
import LoadingSpinner from '../components/LoadingSpinner';

const WishlistPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToCart, cartItems } = useContext(CartContext);
  
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  // Fetch wishlist on component mount
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        const data = await getWishlist();
        setWishlist(data.wishlist || []);
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        setError(err.message || 'Failed to load wishlist');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [isAuthenticated]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      setActionLoading(prev => ({ ...prev, [`remove_${productId}`]: true }));
      await removeFromWishlist(productId);
      
      // Update local state
      setWishlist(prev => prev.filter(item => item._id !== productId));
      
      // Optional: Show success message
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      alert(err.message || 'Failed to remove item from wishlist');
    } finally {
      setActionLoading(prev => ({ ...prev, [`remove_${productId}`]: false }));
    }
  };

  const handleAddToCart = async (product, removeFromWishlist = true) => {
    try {
      setActionLoading(prev => ({ ...prev, [`cart_${product._id}`]: true }));
      
      if (removeFromWishlist) {
        // Use the wishlist service to add to cart and remove from wishlist
        await addToCartFromWishlist(product._id, 1, true);
        
        // Update local wishlist state
        setWishlist(prev => prev.filter(item => item._id !== product._id));
      } else {
        // Use cart context to add to cart without removing from wishlist
        await addToCart(product._id, 1);
      }
      
      // Optional: Show success message
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert(err.message || 'Failed to add item to cart');
    } finally {
      setActionLoading(prev => ({ ...prev, [`cart_${product._id}`]: false }));
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(price);
  };

  const getStockStatusDisplay = (product) => {
    if (!product.inStock) {
      return <span className="text-red-600 font-medium">Out of Stock</span>;
    }
    
    if (product.stockStatus === 'low_stock') {
      return <span className="text-yellow-600 font-medium">Low Stock</span>;
    }
    
    return <span className="text-green-600 font-medium">In Stock</span>;
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Wishlist</h1>
          <p className="text-gray-600 mb-6">Please log in to view your wishlist.</p>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading wishlist</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
        <p className="text-gray-600">
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-600 mb-6">Save items you love by clicking the heart icon on product pages.</p>
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {wishlist.map((product) => (
            <div
              key={product._id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Product Image */}
                <div className="flex-shrink-0 sm:w-48">
                  <Link to={`/products/${product.slug}`}>
                    <img
                      className="h-48 w-full sm:h-full object-cover"
                      src={product.images?.[0] || '/placeholder-image.jpg'}
                      alt={product.name}
                    />
                  </Link>
                </div>

                {/* Product Details */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <div className="flex-1">
                      <Link
                        to={`/products/${product.slug}`}
                        className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200"
                      >
                        {product.name}
                      </Link>
                      
                      {product.shortDescription && (
                        <p className="text-gray-600 mt-2 text-sm">
                          {product.shortDescription}
                        </p>
                      )}

                      <div className="flex items-center mt-3 space-x-4">
                        <span className="text-xl font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        {getStockStatusDisplay(product)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0 sm:ml-6">
                      <button
                        onClick={() => handleAddToCart(product, true)}
                        disabled={!product.inStock || actionLoading[`cart_${product._id}`]}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading[`cart_${product._id}`] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l1.5-6m9.5 0h.01M19 13v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6m10-2a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
                          </svg>
                        )}
                        {!product.inStock ? 'Out of Stock' : 'Add to Cart'}
                      </button>

                      <button
                        onClick={() => handleRemoveFromWishlist(product._id)}
                        disabled={actionLoading[`remove_${product._id}`]}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading[`remove_${product._id}`] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></div>
                        ) : (
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Back to shopping link */}
      {wishlist.length > 0 && (
        <div className="mt-8 text-center">
          <Link
            to="/products"
            className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;