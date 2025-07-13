import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import OrderTrackingDetailPage from '../OrderTrackingDetailPage';
import * as orderService from '../../services/orderService';

// Mock the orderService
vi.mock('../../services/orderService', () => ({
  getOrderTracking: vi.fn(),
  formatCurrency: vi.fn((amount) => `£${amount.toFixed(2)}`)
}));

// Mock the utils/formatters
vi.mock('../../utils/formatters', () => ({
  formatDate: vi.fn((date) => new Date(date).toLocaleDateString())
}));

// Mock useParams
const mockUseParams = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => mockUseParams()
  };
});

const mockTrackingData = {
  data: {
    orderId: '60d5ecb54b24a7001b8b4567',
    orderNumber: 'ORD-12345678-001',
    orderDate: '2023-10-01T10:00:00.000Z',
    totalAmount: 599.99,
    shippingAddress: {
      fullName: 'John Doe',
      addressLine1: '123 Main Street',
      addressLine2: 'Apartment 4B',
      city: 'London',
      stateProvince: 'England',
      postalCode: 'SW1A 1AA',
      country: 'United Kingdom'
    },
    tracking: {
      trackingNumber: 'TEST123456789',
      carrier: 'UPS',
      currentStatus: 'Out for Delivery',
      estimatedDeliveryDate: '2023-10-05T16:00:00.000Z',
      trackingUrl: 'https://www.ups.com/track?tracknum=TEST123456789',
      lastUpdated: '2023-10-04T14:30:00.000Z',
      trackingHistory: [
        {
          status: 'Out for Delivery',
          description: 'Package is out for delivery',
          location: 'London, UK',
          timestamp: '2023-10-04T08:00:00.000Z'
        },
        {
          status: 'In Transit',
          description: 'Package arrived at delivery facility',
          location: 'London, UK',
          timestamp: '2023-10-03T22:00:00.000Z'
        },
        {
          status: 'In Transit',
          description: 'Package in transit',
          location: 'Birmingham, UK',
          timestamp: '2023-10-02T15:30:00.000Z'
        },
        {
          status: 'Shipped',
          description: 'Package picked up by UPS',
          location: 'Manchester, UK',
          timestamp: '2023-10-01T12:00:00.000Z'
        },
        {
          status: 'Order Placed',
          description: 'Order information received',
          location: 'Online',
          timestamp: '2023-10-01T10:00:00.000Z'
        }
      ]
    }
  }
};

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <OrderTrackingDetailPage />
    </BrowserRouter>
  );
};

describe('OrderTrackingDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ orderId: '60d5ecb54b24a7001b8b4567' });
  });

  it('renders loading state initially', () => {
    orderService.getOrderTracking.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderComponent();
    
    expect(screen.getByText('Loading tracking information...')).toBeInTheDocument();
  });

  it('renders order summary information', async () => {
    orderService.getOrderTracking.mockResolvedValue(mockTrackingData);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Track Your Order')).toBeInTheDocument();
    });

    expect(screen.getByText('ORD-12345678-001')).toBeInTheDocument();
    expect(screen.getByText('£599.99')).toBeInTheDocument();
  });

  it('renders shipping address information', async () => {
    orderService.getOrderTracking.mockResolvedValue(mockTrackingData);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('123 Main Street')).toBeInTheDocument();
    expect(screen.getByText('Apartment 4B')).toBeInTheDocument();
    expect(screen.getByText('London, England SW1A 1AA')).toBeInTheDocument();
    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
  });

  it('renders carrier information and tracking details', async () => {
    orderService.getOrderTracking.mockResolvedValue(mockTrackingData);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('UPS')).toBeInTheDocument();
    });

    expect(screen.getByText('Tracking Number: TEST123456789')).toBeInTheDocument();
    expect(screen.getByText('Track on carrier website →')).toBeInTheDocument();
    
    // Check that the external link is correct
    const trackingLink = screen.getByRole('link', { name: 'Track on carrier website →' });
    expect(trackingLink).toHaveAttribute('href', 'https://www.ups.com/track?tracknum=TEST123456789');
    expect(trackingLink).toHaveAttribute('target', '_blank');
  });

  it('renders current status and estimated delivery', async () => {
    orderService.getOrderTracking.mockResolvedValue(mockTrackingData);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Current Status')).toBeInTheDocument();
    });

    // Look for the specific current status in the status section
    const statusSection = screen.getByText('Current Status').closest('div');
    expect(statusSection).toHaveTextContent('Out for Delivery');
    
    expect(screen.getByText(/Estimated Delivery:/)).toBeInTheDocument();
  });

  it('renders tracking timeline with progress indicators', async () => {
    orderService.getOrderTracking.mockResolvedValue(mockTrackingData);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Tracking Progress')).toBeInTheDocument();
    });

    // Check for timeline steps - use getAllByText to handle multiple occurrences
    expect(screen.getAllByText('Order Placed')).toHaveLength(2); // Once in timeline, once in history
    expect(screen.getByText('Processing')).toBeInTheDocument();
    expect(screen.getAllByText('Shipped')).toHaveLength(2); // Timeline and history
    expect(screen.getAllByText('In Transit')).toHaveLength(3); // Timeline + multiple in history
    expect(screen.getAllByText('Out for Delivery')).toHaveLength(3); // Timeline, status, history
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });

  it('renders detailed tracking history', async () => {
    orderService.getOrderTracking.mockResolvedValue(mockTrackingData);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Detailed Tracking History')).toBeInTheDocument();
    });

    // Check for tracking events
    expect(screen.getByText('Package is out for delivery')).toBeInTheDocument();
    expect(screen.getByText('Package arrived at delivery facility')).toBeInTheDocument();
    expect(screen.getByText('Package picked up by UPS')).toBeInTheDocument();
    expect(screen.getByText('Order information received')).toBeInTheDocument();

    // Check for locations
    expect(screen.getAllByText('📍 London, UK')).toHaveLength(2);
    expect(screen.getByText('📍 Birmingham, UK')).toBeInTheDocument();
    expect(screen.getByText('📍 Manchester, UK')).toBeInTheDocument();
    expect(screen.getByText('📍 Online')).toBeInTheDocument();
  });

  it('renders error state when tracking fails', async () => {
    const errorMessage = 'Tracking information not available for this order yet';
    orderService.getOrderTracking.mockRejectedValue(new Error(errorMessage));
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(screen.getByText('← Back to My Orders')).toBeInTheDocument();
  });

  it('handles order without tracking history gracefully', async () => {
    const dataWithoutHistory = {
      ...mockTrackingData,
      data: {
        ...mockTrackingData.data,
        tracking: {
          ...mockTrackingData.data.tracking,
          trackingHistory: []
        }
      }
    };
    
    orderService.getOrderTracking.mockResolvedValue(dataWithoutHistory);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('No tracking history available yet.')).toBeInTheDocument();
    });
  });

  it('shows back to orders link', async () => {
    orderService.getOrderTracking.mockResolvedValue(mockTrackingData);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('← Back to My Orders')).toBeInTheDocument();
    });

    const backLink = screen.getByRole('link', { name: '← Back to My Orders' });
    expect(backLink).toHaveAttribute('href', '/orders');
  });

  it('updates document title with order number', async () => {
    orderService.getOrderTracking.mockResolvedValue(mockTrackingData);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('ORD-12345678-001')).toBeInTheDocument();
    });
    
    // Title should eventually be updated (may take multiple renders)
    await waitFor(() => {
      expect(document.title).toContain('Track Order');
    });
  });

  it('handles missing optional address line 2', async () => {
    const dataWithoutAddressLine2 = {
      ...mockTrackingData,
      data: {
        ...mockTrackingData.data,
        shippingAddress: {
          ...mockTrackingData.data.shippingAddress,
          addressLine2: null
        }
      }
    };
    
    orderService.getOrderTracking.mockResolvedValue(dataWithoutAddressLine2);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Should not render addressLine2 when it's null
    expect(screen.queryByText('Apartment 4B')).not.toBeInTheDocument();
  });

  it('handles missing estimated delivery date', async () => {
    const dataWithoutEstimatedDelivery = {
      ...mockTrackingData,
      data: {
        ...mockTrackingData.data,
        tracking: {
          ...mockTrackingData.data.tracking,
          estimatedDeliveryDate: null
        }
      }
    };
    
    orderService.getOrderTracking.mockResolvedValue(dataWithoutEstimatedDelivery);
    
    renderComponent();
    
    await waitFor(() => {
      const statusSection = screen.getByText('Current Status').closest('div');
      expect(statusSection).toHaveTextContent('Out for Delivery');
    });

    // Should not show estimated delivery section when date is null
    expect(screen.queryByText(/Estimated Delivery:/)).not.toBeInTheDocument();
  });

  it('handles missing tracking URL gracefully', async () => {
    const dataWithoutTrackingUrl = {
      ...mockTrackingData,
      data: {
        ...mockTrackingData.data,
        tracking: {
          ...mockTrackingData.data.tracking,
          trackingUrl: null
        }
      }
    };
    
    orderService.getOrderTracking.mockResolvedValue(dataWithoutTrackingUrl);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('UPS')).toBeInTheDocument();
    });

    // Should not show external tracking link when URL is missing
    expect(screen.queryByText('Track on carrier website →')).not.toBeInTheDocument();
  });
});