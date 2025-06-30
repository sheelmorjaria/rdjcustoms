// Payment Method Constants
export const PAYMENT_METHODS = {
  PAYPAL: 'paypal',
  BITCOIN: 'bitcoin',
  MONERO: 'monero'
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.PAYPAL]: 'PayPal',
  [PAYMENT_METHODS.BITCOIN]: 'Bitcoin',
  [PAYMENT_METHODS.MONERO]: 'Monero'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'Pending',
  [PAYMENT_STATUS.PROCESSING]: 'Processing',
  [PAYMENT_STATUS.COMPLETED]: 'Completed',
  [PAYMENT_STATUS.FAILED]: 'Failed',
  [PAYMENT_STATUS.CANCELLED]: 'Cancelled',
  [PAYMENT_STATUS.REFUNDED]: 'Refunded'
};

// Cryptocurrency Configuration
export const CRYPTO_CONFIG = {
  BITCOIN: {
    CONFIRMATIONS_REQUIRED: 2,
    TIMEOUT_MINUTES: 30
  },
  MONERO: {
    CONFIRMATIONS_REQUIRED: 10,
    TIMEOUT_MINUTES: 20
  }
};