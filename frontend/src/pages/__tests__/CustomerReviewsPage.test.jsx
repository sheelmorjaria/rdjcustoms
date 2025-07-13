import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import CustomerReviewsPage from '../CustomerReviewsPage';
import * as reviewService from '../../services/reviewService';

// Mock the review service
vi.mock('../../services/reviewService');

// Mock LoadingSpinner
vi.mock('../../components/LoadingSpinner', () => ({
  default: () => <div>Loading...</div>
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('CustomerReviewsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    reviewService.getCustomerReviews.mockReturnValue(new Promise(() => {}));
    
    renderWithRouter(<CustomerReviewsPage />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display reviews when data is loaded', async () => {
    const mockReviews = {
      reviews: [
        {
          _id: 'review1',
          rating: 5,
          title: 'Great product!',
          content: 'I absolutely love this product. High quality and fast shipping.',
          status: 'approved',
          formattedDate: '15 January 2024',
          product: {
            _id: 'product1',
            name: 'Test Product',
            slug: 'test-product',
            image: 'product.jpg',
            price: 29.99
          }
        }
      ]
    };

    reviewService.getCustomerReviews.mockResolvedValue(mockReviews);

    renderWithRouter(<CustomerReviewsPage />);

    await waitFor(() => {
      expect(screen.getByText('My Reviews')).toBeInTheDocument();
      expect(screen.getByText('Great product!')).toBeInTheDocument();
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
  });

  it('should display empty state when no reviews', async () => {
    reviewService.getCustomerReviews.mockResolvedValue({ reviews: [] });

    renderWithRouter(<CustomerReviewsPage />);

    await waitFor(() => {
      expect(screen.getByText("You haven't written any reviews yet.")).toBeInTheDocument();
      expect(screen.getByText('Browse Products')).toBeInTheDocument();
    });
  });

  it('should display error state when API fails', async () => {
    reviewService.getCustomerReviews.mockRejectedValue(new Error('Failed to fetch'));

    renderWithRouter(<CustomerReviewsPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });

  it('should navigate to edit page when Edit is clicked', async () => {
    const mockReviews = {
      reviews: [
        {
          _id: 'review1',
          rating: 5,
          title: 'Great product!',
          content: 'Love it!',
          status: 'approved',
          formattedDate: '15 January 2024',
          product: {
            _id: 'product1',
            name: 'Test Product',
            slug: 'test-product'
          }
        }
      ]
    };

    reviewService.getCustomerReviews.mockResolvedValue(mockReviews);

    renderWithRouter(<CustomerReviewsPage />);

    await waitFor(() => {
      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/account/reviews/review1/edit');
  });

  it('should show delete confirmation modal when Delete is clicked', async () => {
    const mockReviews = {
      reviews: [
        {
          _id: 'review1',
          rating: 5,
          title: 'Great product!',
          content: 'Love it!',
          status: 'approved',
          formattedDate: '15 January 2024',
          product: {
            _id: 'product1',
            name: 'Test Product',
            slug: 'test-product'
          }
        }
      ]
    };

    reviewService.getCustomerReviews.mockResolvedValue(mockReviews);

    renderWithRouter(<CustomerReviewsPage />);

    await waitFor(() => {
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);
    });

    // Check for the modal heading specifically
    expect(screen.getByRole('heading', { name: 'Delete Review' })).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete your review/)).toBeInTheDocument();
  });

  it('should delete review when confirmed', async () => {
    const mockReviews = {
      reviews: [
        {
          _id: 'review1',
          rating: 5,
          title: 'Great product!',
          content: 'Love it!',
          status: 'approved',
          formattedDate: '15 January 2024',
          product: {
            _id: 'product1',
            name: 'Test Product',
            slug: 'test-product'
          }
        }
      ]
    };

    reviewService.getCustomerReviews.mockResolvedValue(mockReviews);
    reviewService.deleteCustomerReview.mockResolvedValue({ success: true });

    renderWithRouter(<CustomerReviewsPage />);

    await waitFor(() => {
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);
    });

    const confirmButton = screen.getByRole('button', { name: 'Delete Review' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(reviewService.deleteCustomerReview).toHaveBeenCalledWith('review1');
    });
  });

  it('should close modal when cancel is clicked', async () => {
    const mockReviews = {
      reviews: [
        {
          _id: 'review1',
          rating: 5,
          title: 'Great product!',
          content: 'Love it!',
          status: 'approved',
          formattedDate: '15 January 2024',
          product: {
            _id: 'product1',
            name: 'Test Product',
            slug: 'test-product'
          }
        }
      ]
    };

    reviewService.getCustomerReviews.mockResolvedValue(mockReviews);

    renderWithRouter(<CustomerReviewsPage />);

    await waitFor(() => {
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Delete Review')).not.toBeInTheDocument();
    });
  });

  it('should display correct status badges', async () => {
    const mockReviews = {
      reviews: [
        {
          _id: 'review1',
          rating: 5,
          title: 'Review 1',
          content: 'Content 1',
          status: 'approved',
          formattedDate: '15 January 2024',
          product: { name: 'Product 1' }
        },
        {
          _id: 'review2',
          rating: 4,
          title: 'Review 2',
          content: 'Content 2',
          status: 'pending',
          formattedDate: '16 January 2024',
          product: { name: 'Product 2' }
        },
        {
          _id: 'review3',
          rating: 3,
          title: 'Review 3',
          content: 'Content 3',
          status: 'rejected',
          formattedDate: '17 January 2024',
          product: { name: 'Product 3' }
        }
      ]
    };

    reviewService.getCustomerReviews.mockResolvedValue(mockReviews);

    renderWithRouter(<CustomerReviewsPage />);

    await waitFor(() => {
      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Rejected')).toBeInTheDocument();
    });
  });
});