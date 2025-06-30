// Product Condition Constants
export const PRODUCT_CONDITIONS = {
  NEW: 'new',
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair'
};

export const PRODUCT_CONDITION_LABELS = {
  [PRODUCT_CONDITIONS.NEW]: 'New',
  [PRODUCT_CONDITIONS.EXCELLENT]: 'Excellent',
  [PRODUCT_CONDITIONS.GOOD]: 'Good',
  [PRODUCT_CONDITIONS.FAIR]: 'Fair'
};

export const PRODUCT_CONDITION_COLORS = {
  [PRODUCT_CONDITIONS.NEW]: 'green',
  [PRODUCT_CONDITIONS.EXCELLENT]: 'blue',
  [PRODUCT_CONDITIONS.GOOD]: 'yellow',
  [PRODUCT_CONDITIONS.FAIR]: 'orange'
};

// Stock Status Constants
export const STOCK_STATUS = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock'
};

export const STOCK_STATUS_LABELS = {
  [STOCK_STATUS.IN_STOCK]: 'In Stock',
  [STOCK_STATUS.LOW_STOCK]: 'Low Stock',
  [STOCK_STATUS.OUT_OF_STOCK]: 'Out of Stock'
};

export const STOCK_STATUS_COLORS = {
  [STOCK_STATUS.IN_STOCK]: 'green',
  [STOCK_STATUS.LOW_STOCK]: 'yellow',
  [STOCK_STATUS.OUT_OF_STOCK]: 'red'
};