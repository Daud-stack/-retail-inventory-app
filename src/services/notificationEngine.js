/**
 * Real-time notification system for retail alerts.
 */

const STORAGE_KEY = 'nexus_notifications';

export const NOTIFICATION_TYPES = {
  LOW_STOCK: 'LOW_STOCK',
  EXPIRY_WARNING: 'EXPIRY_WARNING',
  NEW_ORDER: 'NEW_ORDER',
  POS_TRANSACTION: 'POS_TRANSACTION',
  SECURITY: 'SECURITY',
  SYSTEM: 'SYSTEM',
  USER_ACTION: 'USER_ACTION',
};

export const SEVERITY = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
};

let notifications = [];

const loadNotifications = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      notifications = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load notifications:', error);
    notifications = [];
  }
};

const saveNotifications = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Failed to save notifications:', error);
  }
};

loadNotifications();

export const addNotification = ({ type, title, message, severity = SEVERITY.INFO, metadata = {} }) => {
  const newNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    severity,
    timestamp: new Date().toISOString(),
    isRead: false,
    metadata
  };

  notifications.unshift(newNotification);
  saveNotifications();
  return newNotification;
};

export const getNotifications = () => {
  return [...notifications];
};

export const getUnreadCount = () => {
  return notifications.filter(n => !n.isRead).length;
};

export const markAsRead = (notificationId) => {
  const index = notifications.findIndex(n => n.id === notificationId);
  if (index !== -1) {
    notifications[index].isRead = true;
    saveNotifications();
  }
};

export const markAllAsRead = () => {
  notifications = notifications.map(n => ({ ...n, isRead: true }));
  saveNotifications();
};

export const dismissNotification = (notificationId) => {
  notifications = notifications.filter(n => n.id !== notificationId);
  saveNotifications();
};

export const clearAllNotifications = () => {
  notifications = [];
  saveNotifications();
};

export const checkLowStockAlerts = (products) => {
  const oneHourAgo = new Date(Date.now() - 3600000);
  
  products.forEach(product => {
    if (product.stock <= product.reorderPoint) {
      // Deduplication check
      const recentDuplicate = notifications.find(n => 
        n.type === NOTIFICATION_TYPES.LOW_STOCK &&
        n.metadata?.productId === product.id &&
        new Date(n.timestamp) > oneHourAgo
      );

      if (!recentDuplicate) {
        addNotification({
          type: NOTIFICATION_TYPES.LOW_STOCK,
          title: 'Low Stock Alert',
          message: `${product.name} is low on stock (${product.stock} remaining).`,
          severity: SEVERITY.WARNING,
          metadata: { productId: product.id, stock: product.stock }
        });
      }
    }
  });
};

export const checkExpiryAlerts = (products) => {
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  products.forEach(product => {
    if (product.expiryDate) {
      const expDate = new Date(product.expiryDate);
      if (expDate <= thirtyDaysFromNow && expDate >= today) {
        addNotification({
          type: NOTIFICATION_TYPES.EXPIRY_WARNING,
          title: 'Expiry Warning',
          message: `${product.name} will expire on ${expDate.toLocaleDateString()}.`,
          severity: SEVERITY.WARNING,
          metadata: { productId: product.id, expiryDate: product.expiryDate }
        });
      } else if (expDate < today) {
        addNotification({
          type: NOTIFICATION_TYPES.EXPIRY_WARNING,
          title: 'Product Expired',
          message: `${product.name} has expired on ${expDate.toLocaleDateString()}.`,
          severity: SEVERITY.CRITICAL,
          metadata: { productId: product.id, expiryDate: product.expiryDate }
        });
      }
    }
  });
};
