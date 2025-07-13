import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getReferralDashboard,
  getReferralProgramSettings,
  generateReferralLink,
  copyReferralLink,
  shareReferralLink,
  formatRewardDisplayValue,
  getRewardStatusDisplay,
  getReferralStatusDisplay
} from '../services/referralService';

const CustomerReferralDashboardPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [programSettings, setProgramSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSource, setSelectedSource] = useState('direct');

  // Set page title
  useEffect(() => {
    document.title = 'Referral Dashboard - RDJCustoms';
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  // Load dashboard data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError('');
        
        const [dashboard, settings] = await Promise.all([
          getReferralDashboard(),
          getReferralProgramSettings()
        ]);
        
        setDashboardData(dashboard);
        setProgramSettings(settings);
      } catch (err) {
        setError(err.message || 'Failed to load referral data');
        console.error('Error loading referral data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Handle copy referral link
  const handleCopyLink = async () => {
    if (!dashboardData?.referralCode) return;
    
    try {
      const link = generateReferralLink(dashboardData.referralCode, selectedSource);
      const success = await copyReferralLink(link);
      
      if (success) {
        setSuccessMessage('Referral link copied to clipboard!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('Failed to copy link. Please try again.');
        setTimeout(() => setError(''), 3000);
      }
    } catch {
      setError('Failed to copy link. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Handle share referral link
  const handleShareLink = async () => {
    if (!dashboardData?.referralCode) return;
    
    try {
      const link = generateReferralLink(dashboardData.referralCode, selectedSource);
      const success = await shareReferralLink(link, user?.firstName);
      
      if (!success) {
        // Fallback to copy if sharing not supported
        await handleCopyLink();
      }
    } catch (err) {
      console.error('Error sharing link:', err);
      await handleCopyLink(); // Fallback to copy
    }
  };

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div 
            role="status" 
            aria-label="Loading"
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-700"
          ></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !dashboardData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const referralLink = dashboardData?.referralCode 
    ? generateReferralLink(dashboardData.referralCode, selectedSource)
    : '';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forest-900 mb-2">Referral Dashboard</h1>
        <p className="text-forest-600">
          Invite friends and earn rewards when they make their first purchase
        </p>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-forest-100">
          <h3 className="text-sm font-medium text-forest-600 mb-2">Total Referrals</h3>
          <p className="text-3xl font-bold text-forest-900">{dashboardData?.stats?.totalReferrals || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-forest-100">
          <h3 className="text-sm font-medium text-forest-600 mb-2">Successful Referrals</h3>
          <p className="text-3xl font-bold text-green-600">{dashboardData?.stats?.successfulReferrals || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-forest-100">
          <h3 className="text-sm font-medium text-forest-600 mb-2">Total Rewards</h3>
          <p className="text-3xl font-bold text-purple-600">{dashboardData?.stats?.totalRewards || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-forest-100">
          <h3 className="text-sm font-medium text-forest-600 mb-2">Active Rewards</h3>
          <p className="text-3xl font-bold text-blue-600">{dashboardData?.stats?.activeRewards || 0}</p>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="bg-white rounded-lg shadow-md border border-forest-100 mb-8">
        <div className="p-6 border-b border-forest-100">
          <h2 className="text-xl font-semibold text-forest-900 mb-2">Your Referral Link</h2>
          <p className="text-forest-600">Share this link with friends to start earning rewards</p>
        </div>
        
        <div className="p-6">
          {/* Source Selection */}
          <div className="mb-4">
            <label htmlFor="source-select" className="block text-sm font-medium text-forest-700 mb-2">
              Link Source (for tracking):
            </label>
            <select
              id="source-select"
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full md:w-auto px-3 py-2 border border-forest-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
            >
              <option value="direct">Direct Share</option>
              <option value="email">Email</option>
              <option value="social_facebook">Facebook</option>
              <option value="social_twitter">Twitter</option>
              <option value="social_whatsapp">WhatsApp</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Referral Link Display */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="w-full px-4 py-3 border border-forest-300 rounded-lg bg-forest-50 text-forest-800 text-sm"
                placeholder="Your referral link will appear here"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                disabled={!dashboardData?.referralCode}
                className="px-6 py-3 bg-forest-700 text-white rounded-lg hover:bg-forest-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
              
              <button
                type="button"
                onClick={handleShareLink}
                disabled={!dashboardData?.referralCode}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md border border-forest-100">
        <div className="border-b border-forest-100">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-forest-500 text-forest-600'
                  : 'border-transparent text-forest-500 hover:text-forest-600 hover:border-forest-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('referrals')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'referrals'
                  ? 'border-forest-500 text-forest-600'
                  : 'border-transparent text-forest-500 hover:text-forest-600 hover:border-forest-300'
              }`}
            >
              My Referrals ({dashboardData?.referrals?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'rewards'
                  ? 'border-forest-500 text-forest-600'
                  : 'border-transparent text-forest-500 hover:text-forest-600 hover:border-forest-300'
              }`}
            >
              My Rewards ({dashboardData?.rewards?.length || 0})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-forest-900 mb-4">How It Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-forest-700 font-bold">1</span>
                    </div>
                    <h4 className="font-medium text-forest-900 mb-2">Share Your Link</h4>
                    <p className="text-sm text-forest-600">Send your unique referral link to friends and family</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-forest-700 font-bold">2</span>
                    </div>
                    <h4 className="font-medium text-forest-900 mb-2">Friend Signs Up</h4>
                    <p className="text-sm text-forest-600">They register and make their first purchase</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-forest-700 font-bold">3</span>
                    </div>
                    <h4 className="font-medium text-forest-900 mb-2">Earn Rewards</h4>
                    <p className="text-sm text-forest-600">Get {programSettings?.rewardValue || '10'}% discount on your next order</p>
                  </div>
                </div>
              </div>

              {programSettings && (
                <div>
                  <h3 className="text-lg font-semibold text-forest-900 mb-4">Program Benefits</h3>
                  <ul className="space-y-2">
                    {programSettings.benefits?.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-forest-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Referrals Tab */}
          {activeTab === 'referrals' && (
            <div>
              <h3 className="text-lg font-semibold text-forest-900 mb-4">Your Referrals</h3>
              
              {dashboardData?.referrals?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.referrals.map((referral) => {
                    const statusDisplay = getReferralStatusDisplay(referral.status);
                    
                    return (
                      <div key={referral.id} className="border border-forest-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-forest-900">
                              {referral.referredName || 'Anonymous User'}
                            </p>
                            <p className="text-sm text-forest-600">
                              {referral.referredEmail || 'Email not shown'}
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusDisplay.bgClass} ${statusDisplay.colorClass}`}>
                            {statusDisplay.text}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-forest-600">Clicks</p>
                            <p className="font-medium text-forest-900">{referral.clickCount || 0}</p>
                          </div>
                          
                          {referral.registrationDate && (
                            <div>
                              <p className="text-forest-600">Registered</p>
                              <p className="font-medium text-forest-900">
                                {new Date(referral.registrationDate).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          
                          {referral.qualificationDate && (
                            <div>
                              <p className="text-forest-600">Qualified</p>
                              <p className="font-medium text-forest-900">
                                {new Date(referral.qualificationDate).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          
                          {referral.orderAmount && (
                            <div>
                              <p className="text-forest-600">Order Value</p>
                              <p className="font-medium text-forest-900">£{referral.orderAmount.toFixed(2)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-forest-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h4 className="text-lg font-medium text-forest-900 mb-2">No Referrals Yet</h4>
                  <p className="text-forest-600 mb-4">Start sharing your referral link to see your referrals here</p>
                </div>
              )}
            </div>
          )}

          {/* Rewards Tab */}
          {activeTab === 'rewards' && (
            <div>
              <h3 className="text-lg font-semibold text-forest-900 mb-4">Your Rewards</h3>
              
              {dashboardData?.rewards?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.rewards.map((reward) => {
                    const statusDisplay = getRewardStatusDisplay(reward);
                    
                    return (
                      <div key={reward.id} className="border border-forest-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-forest-900">{reward.description}</p>
                            <p className="text-sm text-forest-600">
                              {formatRewardDisplayValue(reward)}
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusDisplay.bgClass} ${statusDisplay.colorClass}`}>
                            {statusDisplay.text}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-forest-600">Code</p>
                            <p className="font-medium text-forest-900">{reward.code || 'AUTO-APPLIED'}</p>
                          </div>
                          
                          <div>
                            <p className="text-forest-600">Issued</p>
                            <p className="font-medium text-forest-900">
                              {new Date(reward.issuedDate).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-forest-600">Expires</p>
                            <p className="font-medium text-forest-900">
                              {new Date(reward.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {reward.isRedeemable && (
                          <div className="mt-3 pt-3 border-t border-forest-100">
                            <button
                              onClick={() => navigate('/products')}
                              className="px-4 py-2 bg-forest-700 text-white rounded-lg hover:bg-forest-800 transition-colors text-sm"
                            >
                              Shop Now
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-forest-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                  <h4 className="text-lg font-medium text-forest-900 mb-2">No Rewards Yet</h4>
                  <p className="text-forest-600 mb-4">Rewards will appear here when your referrals make purchases</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Terms and Conditions */}
      {programSettings?.termsAndConditions && (
        <div className="mt-8 bg-forest-50 rounded-lg border border-forest-200 p-6">
          <h3 className="text-lg font-semibold text-forest-900 mb-4">Terms & Conditions</h3>
          <ul className="space-y-2 text-sm text-forest-700">
            {programSettings.termsAndConditions.map((term, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-forest-400 mt-1">•</span>
                <span>{term}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomerReferralDashboardPage;