/**
 * Centralized audit trail logging engine for NexusRetail App.
 */

const STORAGE_KEY = 'nexus_audit_logs';
const MAX_ENTRIES = 5000;

export const AUDIT_ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CREATE_PRODUCT: 'CREATE_PRODUCT',
  EDIT_PRODUCT: 'EDIT_PRODUCT',
  DELETE_PRODUCT: 'DELETE_PRODUCT',
  RESTOCK: 'RESTOCK',
  POS_CHECKOUT: 'POS_CHECKOUT',
  CREATE_USER: 'CREATE_USER',
  CHANGE_PIN: 'CHANGE_PIN',
  SWITCH_USER: 'SWITCH_USER',
  VIEW_REPORT: 'VIEW_REPORT',
  EXPORT_DATA: 'EXPORT_DATA',
  SYSTEM_CONFIG: 'SYSTEM_CONFIG',
};

// Initialize in-memory logs from localStorage
let auditLogs = [];

const loadLogs = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      auditLogs = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load audit logs:', error);
    auditLogs = [];
  }
};

const saveLogs = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auditLogs));
  } catch (error) {
    console.error('Failed to save audit logs:', error);
  }
};

// Initialize logs on load
loadLogs();

export const logAuditEvent = ({ userId, userName, role, action, target, details, metadata = {} }) => {
  const newEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    userId,
    userName,
    role,
    action,
    target,
    details,
    metadata
  };

  auditLogs.unshift(newEntry); // Add to beginning

  if (auditLogs.length > MAX_ENTRIES) {
    auditLogs = auditLogs.slice(0, MAX_ENTRIES);
  }

  saveLogs();
  return newEntry;
};

export const getAuditLogs = () => {
  return [...auditLogs];
};

export const getAuditLogsByUser = (userId) => {
  return auditLogs.filter(log => log.userId === userId);
};

export const getAuditLogsByAction = (action) => {
  return auditLogs.filter(log => log.action === action);
};

export const getAuditLogsByDateRange = (startDate, endDate) => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return auditLogs.filter(log => {
    const logTime = new Date(log.timestamp).getTime();
    return logTime >= start && logTime <= end;
  });
};

export const clearAuditLogs = () => {
  // Assuming authorization is handled before calling this
  auditLogs = [];
  saveLogs();
};

export const exportAuditLogsCSV = () => {
  if (auditLogs.length === 0) return '';
  const headers = ['ID', 'Timestamp', 'User ID', 'User Name', 'Role', 'Action', 'Target', 'Details'];
  const rows = auditLogs.map(log => [
    log.id,
    log.timestamp,
    log.userId || '',
    log.userName || '',
    log.role || '',
    log.action,
    log.target || '',
    `"${(log.details || '').replace(/"/g, '""')}"`
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};

export const exportAuditLogsJSON = () => {
  return JSON.stringify(auditLogs, null, 2);
};
