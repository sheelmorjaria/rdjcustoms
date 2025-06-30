import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addToWishlist, removeFromWishlist, checkProductInWishlist } from '../services/wishlistService';

const WishlistButton = ({ 
  productId, 
  className = '', 
  showText = true, 
  variant = 'button', // 'button' or 'icon'
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if product is in wishlist on component mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!isAuthenticated || !productId) return;
      
      try {
        const result = await checkProductInWishlist(productId);
        setIsInWishlist(result.isInWishlist);
      } catch (err) {
        console.error('Error checking wishlist status:', err);
        setError('Failed to check wishlist status');
      }
    };

    checkWishlistStatus();
  }, [productId, isAuthenticated]);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Redirect to login or show login modal
      alert('Please log in to add items to your wishlist');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isInWishlist) {
        await removeFromWishlist(productId);
        setIsInWishlist(false);
        // Optional: Show success message
      } else {
        await addToWishlist(productId);
        setIsInWishlist(true);
        // Optional: Show success message
      }
    } catch (err) {
      console.error('Error updating wishlist:', err);
      setError(err.message || 'Failed to update wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Size configurations
  const sizeClasses = {
    small: {
      button: 'px-2 py-1 text-sm',
      icon: 'w-6 h-6 p-1',
      text: 'text-xs'
    },
    medium: {
      button: 'px-4 py-2 text-sm',
      icon: 'w-8 h-8 p-1',
      text: 'text-sm'
    },
    large: {
      button: 'px-6 py-3 text-base',
      icon: 'w-10 h-10 p-2',
      text: 'text-base'
    }
  };

  // Base classes for styling
  const baseClasses = `
    inline-flex items-center justify-center
    border border-gray-300 rounded-md
    transition-all duration-200 ease-in-out
    hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  // Wishlist state classes
  const stateClasses = isInWishlist
    ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
    : 'bg-white text-gray-700 hover:bg-gray-50';

  // Heart icon SVG
  const HeartIcon = ({ filled = false }) => (
    <svg
      className={`w-5 h-5 ${filled ? 'fill-current' : 'fill-none stroke-current'}`}
      viewBox="0 0 24 24"
      strokeWidth="2"
    >
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <button
        onClick={handleWishlistToggle}
        disabled={isLoading}
        className={`
          ${baseClasses}
          ${stateClasses}
          ${sizeClasses[size].icon}
          ${className}
        `}
        title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        ) : (
          <HeartIcon filled={isInWishlist} />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleWishlistToggle}
      disabled={isLoading}
      className={`
        ${baseClasses}
        ${stateClasses}
        ${sizeClasses[size].button}
        ${className}
      `}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
      ) : (
        <HeartIcon filled={isInWishlist} />
      )}
      
      {showText && (
        <span className={`ml-2 ${sizeClasses[size].text}`}>
          {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
        </span>
      )}
    </button>
  );
};

export default WishlistButton;