const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Helper function to make authenticated API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    // Token expired or invalid, redirect to login
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Authentication required');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
};

/**
 * Get referral dashboard data
 * @returns {Promise<Object>} Referral dashboard data
 */
export const getReferralDashboard = async () => {
  try {
    const data = await apiRequest('/user/referral/dashboard');
    return data.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch referral dashboard');
  }
};

/**
 * Validate a referral code
 * @param {string} referralCode - The referral code to validate
 * @returns {Promise<Object>} Validation result
 */
export const validateReferralCode = async (referralCode) => {
  try {
    const data = await apiRequest(`/referral/validate/${referralCode}`);
    return data.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to validate referral code');
  }
};

/**
 * Track a referral click
 * @param {string} referralCode - The referral code that was clicked
 * @param {string} source - The source of the click (e.g., 'direct', 'email', 'social_facebook')
 * @returns {Promise<Object>} Click tracking result
 */
export const trackReferralClick = async (referralCode, source = 'direct') => {
  try {
    const data = await apiRequest(`/referral/track/${referralCode}`, {
      method: 'POST',
      body: JSON.stringify({ source }),
    });
    return data.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to track referral click');
  }
};

/**
 * Get referral program settings
 * @returns {Promise<Object>} Program settings
 */
export const getReferralProgramSettings = async () => {
  try {
    const data = await apiRequest('/referral/program-settings');
    return data.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch program settings');
  }
};

/**
 * Generate referral link with UTM parameters
 * @param {string} referralCode - User's referral code
 * @param {string} source - UTM source (e.g., 'email', 'social_facebook')
 * @param {string} medium - UTM medium (default: 'referral')
 * @param {string} campaign - UTM campaign (default: 'friend_referral')
 * @returns {string} Complete referral URL
 */
export const generateReferralLink = (referralCode, source = 'direct', medium = 'referral', campaign = 'friend_referral') => {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams({
    ref: referralCode,
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign
  });
  
  return `${baseUrl}/?${params.toString()}`;
};

/**
 * Copy referral link to clipboard
 * @param {string} referralLink - The referral link to copy
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const copyReferralLink = async (referralLink) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(referralLink);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (error) {
    console.error('Failed to copy referral link:', error);
    return false;
  }
};

/**
 * Share referral link via Web Share API (if supported)
 * @param {string} referralLink - The referral link to share
 * @param {string} referrerName - Name of the person sharing
 * @returns {Promise<boolean>} True if successful, false if not supported or failed
 */
export const shareReferralLink = async (referralLink, referrerName = 'Friend') => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: 'Join RDJCustoms',
        text: `${referrerName} has invited you to join RDJCustoms! Get exclusive benefits when you sign up.`,
        url: referralLink,
      });
      return true;
    }
    return false; // Web Share API not supported
  } catch (error) {
    console.error('Failed to share referral link:', error);
    return false;
  }
};

/**
 * Format referral reward display value
 * @param {Object} reward - Reward object
 * @returns {string} Formatted display value
 */
export const formatRewardDisplayValue = (reward) => {
  switch (reward.type) {
    case 'discount_percent':
      return `${reward.value}% off`;
    case 'discount_fixed':
      return `£${reward.value} off`;
    case 'store_credit':
      return `£${reward.value} credit`;
    case 'free_shipping':
      return 'Free shipping';
    case 'cashback':
      return `£${reward.value} cashback`;
    default:
      return `${reward.value} reward`;
  }
};

/**
 * Get reward status display text and color
 * @param {Object} reward - Reward object
 * @returns {Object} Object with status text and color class
 */
export const getRewardStatusDisplay = (reward) => {
  if (reward.isRedeemed) {
    return {
      text: 'Redeemed',
      colorClass: 'text-gray-500',
      bgClass: 'bg-gray-100'
    };
  }
  
  if (reward.isExpired) {
    return {
      text: 'Expired',
      colorClass: 'text-red-600',
      bgClass: 'bg-red-100'
    };
  }
  
  if (reward.isRedeemable) {
    return {
      text: 'Available',
      colorClass: 'text-green-600',
      bgClass: 'bg-green-100'
    };
  }
  
  return {
    text: 'Pending',
    colorClass: 'text-yellow-600',
    bgClass: 'bg-yellow-100'
  };
};

/**
 * Get referral status display text and color
 * @param {string} status - Referral status
 * @returns {Object} Object with status text and color class
 */
export const getReferralStatusDisplay = (status) => {
  switch (status) {
    case 'pending':
      return {
        text: 'Link Clicked',
        colorClass: 'text-blue-600',
        bgClass: 'bg-blue-100'
      };
    case 'registered':
      return {
        text: 'Friend Registered',
        colorClass: 'text-yellow-600',
        bgClass: 'bg-yellow-100'
      };
    case 'qualified':
      return {
        text: 'Qualified',
        colorClass: 'text-green-600',
        bgClass: 'bg-green-100'
      };
    case 'rewarded':
      return {
        text: 'Reward Issued',
        colorClass: 'text-purple-600',
        bgClass: 'bg-purple-100'
      };
    case 'expired':
      return {
        text: 'Expired',
        colorClass: 'text-red-600',
        bgClass: 'bg-red-100'
      };
    default:
      return {
        text: 'Unknown',
        colorClass: 'text-gray-600',
        bgClass: 'bg-gray-100'
      };
  }
};