import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import CustomerReferralDashboardPage from '../CustomerReferralDashboardPage';
import { useAuth } from '../../contexts/AuthContext';
import * as referralService from '../../services/referralService';

// Mock the auth context
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock the referral service
vi.mock('../../services/referralService', () => ({
  getReferralDashboard: vi.fn(),
  getReferralProgramSettings: vi.fn(),
  generateReferralLink: vi.fn(),
  copyReferralLink: vi.fn(),
  shareReferralLink: vi.fn(),
  formatRewardDisplayValue: vi.fn(),
  getRewardStatusDisplay: vi.fn(),
  getReferralStatusDisplay: vi.fn()
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

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('CustomerReferralDashboardPage', () => {
  const mockUser = {
    _id: 'user123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com'
  };

  const mockDashboardData = {
    referralCode: 'JOHN123',
    stats: {
      totalReferrals: 5,
      successfulReferrals: 3,
      totalRewards: 2,
      activeRewards: 1
    },
    referrals: [
      {
        id: 'ref1',
        referredName: 'Jane Doe',
        referredEmail: 'jane@example.com',
        status: 'qualified',
        clickCount: 2,
        registrationDate: '2024-01-15T10:00:00Z',
        qualificationDate: '2024-01-20T10:00:00Z',
        orderAmount: 75.50
      }
    ],
    rewards: [
      {
        id: 'reward1',
        type: 'discount_percent',
        value: 10,
        description: '10% discount for referral',
        code: 'REF10',
        issuedDate: '2024-01-20T10:00:00Z',
        expiryDate: '2024-04-20T10:00:00Z',
        isRedeemable: true,
        isRedeemed: false,
        isExpired: false
      }
    ]
  };

  const mockProgramSettings = {
    programActive: true,
    rewardType: 'discount_percent',
    rewardValue: 10,
    rewardDescription: '10% discount on your next order',
    benefits: [
      'Earn 10% discount for each successful referral',
      'No limit on the number of friends you can refer'
    ],
    termsAndConditions: [
      'Referral rewards are valid for 90 days from issue date',
      'Maximum discount value is £50'
    ]
  };

  beforeEach(() => {
    // Setup default mocks
    useAuth.mockReturnValue({
      user: mockUser,
      isLoading: false
    });

    referralService.getReferralDashboard.mockResolvedValue(mockDashboardData);
    referralService.getReferralProgramSettings.mockResolvedValue(mockProgramSettings);
    referralService.generateReferralLink.mockReturnValue('https://example.com/?ref=JOHN123&utm_source=direct&utm_medium=referral&utm_campaign=friend_referral');
    referralService.copyReferralLink.mockResolvedValue(true);
    referralService.shareReferralLink.mockResolvedValue(true);
    referralService.formatRewardDisplayValue.mockReturnValue('10% off');
    referralService.getRewardStatusDisplay.mockReturnValue({
      text: 'Available',
      colorClass: 'text-green-600',
      bgClass: 'bg-green-100'
    });
    referralService.getReferralStatusDisplay.mockReturnValue({
      text: 'Qualified',
      colorClass: 'text-green-600',
      bgClass: 'bg-green-100'
    });

    // Clear navigate mock
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication and Loading', () => {
    it('should redirect to login when user is not authenticated', () => {
      useAuth.mockReturnValue({
        user: null,
        isLoading: false
      });

      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should show loading spinner when auth is loading', () => {
      useAuth.mockReturnValue({
        user: null,
        isLoading: true
      });

      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should show loading spinner when dashboard data is loading', () => {
      referralService.getReferralDashboard.mockImplementation(() => 
        new Promise(() => {}) // Never resolves
      );

      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Dashboard Content', () => {
    it('should render dashboard with user data', async () => {
      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Referral Dashboard')).toBeInTheDocument();
      });

      // Check stats are displayed
      expect(screen.getByText('5')).toBeInTheDocument(); // Total referrals
      expect(screen.getByText('3')).toBeInTheDocument(); // Successful referrals
      expect(screen.getByText('2')).toBeInTheDocument(); // Total rewards
      expect(screen.getByText('1')).toBeInTheDocument(); // Active rewards
    });

    it('should display referral link section', async () => {
      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Your Referral Link')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue(/https:\/\/example\.com\/\?ref=JOHN123/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    });

    it('should handle source selection change', async () => {
      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/link source/i)).toBeInTheDocument();
      });

      const sourceSelect = screen.getByLabelText(/link source/i);
      fireEvent.change(sourceSelect, { target: { value: 'email' } });

      expect(sourceSelect.value).toBe('email');
    });
  });

  describe('Tab Navigation', () => {
    it('should render all tabs', async () => {
      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /overview/i })).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /my referrals \(1\)/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /my rewards \(1\)/i })).toBeInTheDocument();
    });

    it('should switch tabs correctly', async () => {
      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('How It Works')).toBeInTheDocument();
      });

      // Switch to referrals tab
      fireEvent.click(screen.getByRole('button', { name: /my referrals/i }));
      expect(screen.getByText('Your Referrals')).toBeInTheDocument();

      // Switch to rewards tab
      fireEvent.click(screen.getByRole('button', { name: /my rewards/i }));
      expect(screen.getByText('Your Rewards')).toBeInTheDocument();
    });
  });

  describe('Overview Tab', () => {
    it('should display how it works section', async () => {
      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('How It Works')).toBeInTheDocument();
      });

      expect(screen.getByText('Share Your Link')).toBeInTheDocument();
      expect(screen.getByText('Friend Signs Up')).toBeInTheDocument();
      expect(screen.getByText('Earn Rewards')).toBeInTheDocument();
    });

    it('should display program benefits', async () => {
      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Program Benefits')).toBeInTheDocument();
      });

      expect(screen.getByText('Earn 10% discount for each successful referral')).toBeInTheDocument();
      expect(screen.getByText('No limit on the number of friends you can refer')).toBeInTheDocument();
    });
  });

  describe('Referrals Tab', () => {
    it('should display referral list', async () => {
      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /my referrals/i }));
      });

      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('£75.50')).toBeInTheDocument();
    });

    it('should show empty state when no referrals', async () => {
      referralService.getReferralDashboard.mockResolvedValue({
        ...mockDashboardData,
        referrals: []
      });

      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /my referrals/i }));
      });

      expect(screen.getByText('No Referrals Yet')).toBeInTheDocument();
      expect(screen.getByText('Start sharing your referral link to see your referrals here')).toBeInTheDocument();
    });
  });

  describe('Rewards Tab', () => {
    it('should display reward list', async () => {
      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /my rewards/i }));
      });

      expect(screen.getByText('10% discount for referral')).toBeInTheDocument();
      expect(screen.getByText('REF10')).toBeInTheDocument();
    });

    it('should show shop now button for redeemable rewards', async () => {
      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /my rewards/i }));
      });

      const shopButton = screen.getByRole('button', { name: /shop now/i });
      expect(shopButton).toBeInTheDocument();

      fireEvent.click(shopButton);
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });

    it('should show empty state when no rewards', async () => {
      referralService.getReferralDashboard.mockResolvedValue({
        ...mockDashboardData,
        rewards: []
      });

      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /my rewards/i }));
      });

      expect(screen.getByText('No Rewards Yet')).toBeInTheDocument();
      expect(screen.getByText('Rewards will appear here when your referrals make purchases')).toBeInTheDocument();
    });
  });

  describe('Copy and Share Functionality', () => {
    it('should copy referral link successfully', async () => {
      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /copy/i }));

      await waitFor(() => {
        expect(referralService.copyReferralLink).toHaveBeenCalled();
      });

      expect(screen.getByText('Referral link copied to clipboard!')).toBeInTheDocument();
    });

    it('should handle copy failure', async () => {
      referralService.copyReferralLink.mockResolvedValue(false);

      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /copy/i }));

      await waitFor(() => {
        expect(screen.getByText('Failed to copy link. Please try again.')).toBeInTheDocument();
      });
    });

    it('should share referral link successfully', async () => {
      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /share/i }));

      await waitFor(() => {
        expect(referralService.shareReferralLink).toHaveBeenCalled();
      });
    });

    it('should fallback to copy when sharing fails', async () => {
      referralService.shareReferralLink.mockResolvedValue(false);

      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /share/i }));

      await waitFor(() => {
        expect(referralService.copyReferralLink).toHaveBeenCalled();
      });
    });
  });

  describe('Terms and Conditions', () => {
    it('should display terms and conditions', async () => {
      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Terms & Conditions')).toBeInTheDocument();
      });

      expect(screen.getByText('Referral rewards are valid for 90 days from issue date')).toBeInTheDocument();
      expect(screen.getByText('Maximum discount value is £50')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error when dashboard loading fails', async () => {
      referralService.getReferralDashboard.mockRejectedValue(new Error('Failed to load dashboard'));

      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument();
      });

      expect(screen.getByText('Failed to load dashboard')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should retry loading when try again button is clicked', async () => {
      referralService.getReferralDashboard.mockRejectedValue(new Error('Failed to load dashboard'));

      // Mock window.location.reload
      const originalReload = window.location.reload;
      Object.defineProperty(window.location, 'reload', {
        writable: true,
        value: vi.fn(),
      });

      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /try again/i }));
      expect(window.location.reload).toHaveBeenCalled();

      // Restore original reload
      window.location.reload = originalReload;
    });
  });

  describe('Accessibility', () => {
    it('should have proper page title', async () => {
      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      expect(document.title).toBe('Referral Dashboard - RDJCustoms');
    });

    it('should have proper button labels', async () => {
      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy/i })).toHaveAttribute('type', 'button');
      });

      expect(screen.getByRole('button', { name: /share/i })).toHaveAttribute('type', 'button');
    });

    it('should disable buttons when no referral code', async () => {
      referralService.getReferralDashboard.mockResolvedValue({
        ...mockDashboardData,
        referralCode: null
      });

      render(
        <TestWrapper>
          <CustomerReferralDashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy/i })).toBeDisabled();
      });

      expect(screen.getByRole('button', { name: /share/i })).toBeDisabled();
    });
  });
});