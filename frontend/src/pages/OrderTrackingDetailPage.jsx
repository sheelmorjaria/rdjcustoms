import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderTracking, formatCurrency } from '../services/orderService';
import { formatDate } from '../utils/formatters';

const OrderTrackingDetailPage = () => {
  const { orderId } = useParams();
  const [trackingData, setTrackingData] = useState(null);
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTrackingData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getOrderTracking(orderId);
      setTrackingData(response.data.tracking);
      setOrderInfo({
        orderId: response.data.orderId,
        orderNumber: response.data.orderNumber,
        orderDate: response.data.orderDate,
        totalAmount: response.data.totalAmount,
        shippingAddress: response.data.shippingAddress
      });
    } catch (err) {
      setError(err.message || 'Failed to load tracking information');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadTrackingData();
  }, [loadTrackingData]);

  useEffect(() => {
    document.title = trackingData 
      ? `Track Order ${orderInfo?.orderNumber || ''} - RDJCustoms`
      : 'Order Tracking - RDJCustoms';
  }, [trackingData, orderInfo]);

  const getTrackingSteps = () => {
    const steps = [
      { key: 'order_placed', label: 'Order Placed', status: 'Order Placed' },
      { key: 'processing', label: 'Processing', status: 'Processing' },
      { key: 'shipped', label: 'Shipped', status: 'Shipped' },
      { key: 'in_transit', label: 'In Transit', status: 'In Transit' },
      { key: 'out_for_delivery', label: 'Out for Delivery', status: 'Out for Delivery' },
      { key: 'delivered', label: 'Delivered', status: 'Delivered' }
    ];

    return steps;
  };

  const getStepStatus = (step) => {
    if (!trackingData?.trackingHistory) return 'pending';
    
    // Find if this step has been reached
    const hasStepOccurred = trackingData.trackingHistory.some(h => 
      h.status.toLowerCase().includes(step.key.replace('_', ' '))
    );
    
    if (hasStepOccurred) return 'completed';
    if (step.status === trackingData.currentStatus) return 'current';
    return 'pending';
  };

  const formatTrackingDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="order-tracking-page">
        <div className="container mx-auto px-4 py-8">
          <div className="loading">Loading tracking information...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-tracking-page">
        <div className="container mx-auto px-4 py-8">
          <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
            {error}
          </div>
          <div className="mt-4">
            <Link to="/orders" className="text-blue-600 hover:underline">
              ← Back to My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-tracking-page">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/orders" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to My Orders
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Track Your Order</h1>
          <p className="text-gray-600">
            Real-time tracking information for your order
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="font-medium">{orderInfo.orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="font-medium">{formatDate(orderInfo.orderDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="font-medium">{formatCurrency(orderInfo.totalAmount)}</p>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Shipping Address</p>
              <div className="text-gray-800">
                <p>{orderInfo.shippingAddress.fullName}</p>
                <p>{orderInfo.shippingAddress.addressLine1}</p>
                {orderInfo.shippingAddress.addressLine2 && (
                  <p>{orderInfo.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {orderInfo.shippingAddress.city}, {orderInfo.shippingAddress.stateProvince} {orderInfo.shippingAddress.postalCode}
                </p>
                <p>{orderInfo.shippingAddress.country}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Carrier Information</p>
              <div className="text-gray-800">
                <p className="font-medium">{trackingData.carrier}</p>
                <p>Tracking Number: {trackingData.trackingNumber}</p>
                {trackingData.trackingUrl && (
                  <a 
                    href={trackingData.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mt-2 inline-block"
                  >
                    Track on carrier website →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tracking Progress</h2>
          
          {/* Current Status */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Current Status</p>
            <p className="text-lg font-semibold text-blue-800">{trackingData.currentStatus}</p>
            {trackingData.estimatedDeliveryDate && (
              <p className="text-sm text-gray-600 mt-2">
                Estimated Delivery: {formatDate(trackingData.estimatedDeliveryDate)}
              </p>
            )}
          </div>

          {/* Progress Timeline */}
          <div className="relative">
            <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gray-300"></div>
            {getTrackingSteps().map((step, index) => {
              const status = getStepStatus(step);
              const isCompleted = status === 'completed';
              const isCurrent = status === 'current';
              
              return (
                <div key={step.key} className="relative flex items-center mb-8 last:mb-0">
                  <div className={`
                    relative z-10 w-16 h-16 rounded-full flex items-center justify-center
                    ${isCompleted ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-gray-300'}
                    transition-colors duration-300
                  `}>
                    {isCompleted ? (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className={`text-lg font-semibold ${isCurrent || isCompleted ? 'text-white' : 'text-gray-500'}`}>
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div className="ml-6">
                    <p className={`font-medium ${isCurrent || isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.label}
                    </p>
                    {/* Find matching tracking event */}
                    {trackingData.trackingHistory
                      .filter(event => event.status.toLowerCase().includes(step.key.replace('_', ' ')))
                      .map((event, i) => (
                        <p key={i} className="text-sm text-gray-600 mt-1">
                          {formatTrackingDate(event.timestamp)}
                        </p>
                      ))
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Tracking History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Detailed Tracking History</h2>
          <div className="space-y-4">
            {trackingData.trackingHistory && trackingData.trackingHistory.length > 0 ? (
              trackingData.trackingHistory
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((event, index) => (
                  <div key={index} className="border-l-4 border-gray-200 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{event.status}</p>
                        <p className="text-sm text-gray-600">{event.description}</p>
                        {event.location && (
                          <p className="text-sm text-gray-500 mt-1">
                            📍 {event.location}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 ml-4 whitespace-nowrap">
                        {formatTrackingDate(event.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-gray-500">No tracking history available yet.</p>
            )}
          </div>
          
          {trackingData.lastUpdated && (
            <p className="text-sm text-gray-500 mt-6">
              Last updated: {formatTrackingDate(trackingData.lastUpdated)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingDetailPage;