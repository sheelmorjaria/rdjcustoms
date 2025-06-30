// Order Status Constants
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pending Payment',
  [ORDER_STATUS.CONFIRMED]: 'Order Confirmed',
  [ORDER_STATUS.PROCESSING]: 'Processing',
  [ORDER_STATUS.SHIPPED]: 'Shipped',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
  [ORDER_STATUS.REFUNDED]: 'Refunded'
};

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: 'yellow',
  [ORDER_STATUS.CONFIRMED]: 'blue',
  [ORDER_STATUS.PROCESSING]: 'purple',
  [ORDER_STATUS.SHIPPED]: 'indigo',
  [ORDER_STATUS.DELIVERED]: 'green',
  [ORDER_STATUS.CANCELLED]: 'red',
  [ORDER_STATUS.REFUNDED]: 'gray'
};