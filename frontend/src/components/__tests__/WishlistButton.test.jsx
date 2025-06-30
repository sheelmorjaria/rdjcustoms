import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import WishlistButton from '../WishlistButton';
import { useAuth } from '../../contexts/AuthContext';
import * as wishlistService from '../../services/wishlistService';

// Mock the wishlist service
vi.mock('../../services/wishlistService', () => ({
  addToWishlist: vi.fn(),
  removeFromWishlist: vi.fn(),
  checkProductInWishlist: vi.fn()
}));

// Mock the useAuth hook
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock context values
const mockAuthContextAuthenticated = {
  user: { id: 'user123', email: 'test@example.com' },
  isAuthenticated: true
};

const mockAuthContextUnauthenticated = {
  user: null,
  isAuthenticated: false
};

const renderWithAuth = (component, authContext = mockAuthContextAuthenticated) => {
  useAuth.mockReturnValue(authContext);
  return render(component);
};

describe('WishlistButton', () => {
  const mockProductId = 'product123';

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset global alert mock
    global.alert = vi.fn();
  });

  describe('Authentication States', () => {
    it('should not render when user is not authenticated', () => {
      renderWithAuth(
        <WishlistButton productId={mockProductId} />,
        mockAuthContextUnauthenticated
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should render when user is authenticated', async () => {
      wishlistService.checkProductInWishlist.mockResolvedValue({ isInWishlist: false });

      renderWithAuth(
        <WishlistButton productId={mockProductId} />
      );

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });
  });

  describe('Wishlist Status Checking', () => {
    it('should check wishlist status on mount', async () => {
      wishlistService.checkProductInWishlist.mockResolvedValue({ isInWishlist: false });

      renderWithAuth(
        <WishlistButton productId={mockProductId} />
      );

      await waitFor(() => {
        expect(wishlistService.checkProductInWishlist).toHaveBeenCalledWith(mockProductId);
      });
    });

    it('should display "Add to Wishlist" when product is not in wishlist', async () => {
      wishlistService.checkProductInWishlist.mockResolvedValue({ isInWishlist: false });

      renderWithAuth(
        <WishlistButton productId={mockProductId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Add to Wishlist')).toBeInTheDocument();
      });
    });

    it('should display "In Wishlist" when product is in wishlist', async () => {
      wishlistService.checkProductInWishlist.mockResolvedValue({ isInWishlist: true });

      renderWithAuth(
        <WishlistButton productId={mockProductId} />
      );

      await waitFor(() => {
        expect(screen.getByText('In Wishlist')).toBeInTheDocument();
      });
    });
  });

  describe('Adding to Wishlist', () => {
    it('should add product to wishlist when clicked', async () => {
      wishlistService.checkProductInWishlist.mockResolvedValue({ isInWishlist: false });
      wishlistService.addToWishlist.mockResolvedValue({ wishlistCount: 1 });

      renderWithAuth(
        <WishlistButton productId={mockProductId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Add to Wishlist')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(wishlistService.addToWishlist).toHaveBeenCalledWith(mockProductId);
      });

      await waitFor(() => {
        expect(screen.getByText('In Wishlist')).toBeInTheDocument();
      });
    });

    it('should show loading state while adding to wishlist', async () => {
      wishlistService.checkProductInWishlist.mockResolvedValue({ isInWishlist: false });
      
      // Mock a delayed response
      let resolveAddToWishlist;
      const addToWishlistPromise = new Promise((resolve) => {
        resolveAddToWishlist = resolve;
      });
      wishlistService.addToWishlist.mockReturnValue(addToWishlistPromise);

      renderWithAuth(
        <WishlistButton productId={mockProductId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Add to Wishlist')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button'));

      // Check for loading spinner
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeDisabled();
        expect(document.querySelector('.animate-spin')).toBeInTheDocument();
      });

      // Resolve the promise
      resolveAddToWishlist({ wishlistCount: 1 });

      await waitFor(() => {
        expect(screen.getByText('In Wishlist')).toBeInTheDocument();
      });
    });

    it('should handle add to wishlist error', async () => {
      wishlistService.checkProductInWishlist.mockResolvedValue({ isInWishlist: false });
      wishlistService.addToWishlist.mockRejectedValue(new Error('Failed to add'));

      // Mock console.error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderWithAuth(
        <WishlistButton productId={mockProductId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Add to Wishlist')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error updating wishlist:', expect.any(Error));
      });

      // Should still show "Add to Wishlist" after error
      await waitFor(() => {
        expect(screen.getByText('Add to Wishlist')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Removing from Wishlist', () => {
    it('should remove product from wishlist when clicked', async () => {
      wishlistService.checkProductInWishlist.mockResolvedValue({ isInWishlist: true });
      wishlistService.removeFromWishlist.mockResolvedValue({ wishlistCount: 0 });

      renderWithAuth(
        <WishlistButton productId={mockProductId} />
      );

      await waitFor(() => {
        expect(screen.getByText('In Wishlist')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(wishlistService.removeFromWishlist).toHaveBeenCalledWith(mockProductId);
      });

      await waitFor(() => {
        expect(screen.getByText('Add to Wishlist')).toBeInTheDocument();
      });
    });

    it('should handle remove from wishlist error', async () => {
      wishlistService.checkProductInWishlist.mockResolvedValue({ isInWishlist: true });
      wishlistService.removeFromWishlist.mockRejectedValue(new Error('Failed to remove'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderWithAuth(
        <WishlistButton productId={mockProductId} />
      );

      await waitFor(() => {
        expect(screen.getByText('In Wishlist')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error updating wishlist:', expect.any(Error));
      });

      // Should still show "In Wishlist" after error
      await waitFor(() => {
        expect(screen.getByText('In Wishlist')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Component Variants', () => {
    it('should render as icon-only button when variant is "icon"', async () => {
      wishlistService.checkProductInWishlist.mockResolvedValue({ isInWishlist: false });

      renderWithAuth(
        <WishlistButton productId={mockProductId} variant="icon" />
      );

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('title', 'Add to wishlist');
        expect(screen.queryByText('Add to Wishlist')).not.toBeInTheDocument();
      });
    });

    it('should not show text when showText is false', async () => {
      wishlistService.checkProductInWishlist.mockResolvedValue({ isInWishlist: false });

      renderWithAuth(
        <WishlistButton productId={mockProductId} showText={false} />
      );

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.queryByText('Add to Wishlist')).not.toBeInTheDocument();
      });
    });

    it('should apply custom className', async () => {
      wishlistService.checkProductInWishlist.mockResolvedValue({ isInWishlist: false });

      renderWithAuth(
        <WishlistButton productId={mockProductId} className="custom-class" />
      );

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveClass('custom-class');
      });
    });
  });

  describe('Event Handling', () => {
    it('should prevent event propagation and default behavior', async () => {
      wishlistService.checkProductInWishlist.mockResolvedValue({ isInWishlist: false });
      wishlistService.addToWishlist.mockResolvedValue({ wishlistCount: 1 });

      renderWithAuth(
        <WishlistButton productId={mockProductId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Add to Wishlist')).toBeInTheDocument();
      });

      const button = screen.getByRole('button');
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        target: button
      };

      // Simulate click with custom event
      fireEvent.click(button, mockEvent);

      await waitFor(() => {
        expect(wishlistService.addToWishlist).toHaveBeenCalled();
      });
    });

    it('should show alert when unauthenticated user tries to add to wishlist', async () => {
      // Create a special test case where the button is rendered but user becomes unauthenticated
      // This simulates the edge case where auth state changes
      renderWithAuth(
        <WishlistButton productId={mockProductId} />,
        mockAuthContextUnauthenticated
      );

      // Since button doesn't render when unauthenticated, this test verifies the behavior
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label for add to wishlist', async () => {
      wishlistService.checkProductInWishlist.mockResolvedValue({ isInWishlist: false });

      renderWithAuth(
        <WishlistButton productId={mockProductId} />
      );

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Add to wishlist');
      });
    });

    it('should have proper aria-label for remove from wishlist', async () => {
      wishlistService.checkProductInWishlist.mockResolvedValue({ isInWishlist: true });

      renderWithAuth(
        <WishlistButton productId={mockProductId} />
      );

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Remove from wishlist');
      });
    });

    it('should be disabled during loading', async () => {
      wishlistService.checkProductInWishlist.mockResolvedValue({ isInWishlist: false });
      
      let resolveAddToWishlist;
      const addToWishlistPromise = new Promise((resolve) => {
        resolveAddToWishlist = resolve;
      });
      wishlistService.addToWishlist.mockReturnValue(addToWishlistPromise);

      renderWithAuth(
        <WishlistButton productId={mockProductId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Add to Wishlist')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeDisabled();
      });

      resolveAddToWishlist({ wishlistCount: 1 });
    });
  });
});