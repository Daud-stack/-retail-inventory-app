import React from 'react';
import { AlertTriangle, Clock, ShoppingCart, Shield, Bell, X, CheckCheck, Trash2 } from 'lucide-react';

const NotificationCenter = ({ 
  isOpen, 
  onClose, 
  notifications = [], 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onDismiss, 
  onClearAll 
}) => {
  if (!isOpen) return null;

  const critical = notifications.filter(n => n.severity === 'critical');
  const warning = notifications.filter(n => n.severity === 'warning');
  const info = notifications.filter(n => n.severity === 'info' || !n.severity);
  
  const sortedNotifications = [...critical, ...warning, ...info];
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'low_stock': return <AlertTriangle size={18} />;
      case 'expiry': return <Clock size={18} />;
      case 'pos': return <ShoppingCart size={18} />;
      case 'security': return <Shield size={18} />;
      case 'system':
      default: return <Bell size={18} />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-red-500';
      case 'warning': return 'bg-amber-500 text-amber-500';
      case 'info':
      default: return 'bg-blue-500 text-blue-500';
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-slate-900 border-l border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur">
          <div className="flex items-center gap-2">
            <Bell className="text-indigo-400" size={20} />
            <h2 className="text-lg font-bold text-slate-100">Notification Center</h2>
            {unreadCount > 0 && (
              <span className="bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Actions */}
        <div className="p-3 border-b border-slate-800 flex justify-between bg-slate-900/50">
          <button 
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
          <button 
            onClick={onClearAll}
            disabled={notifications.length === 0}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 size={14} />
            Clear all
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {sortedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-full">
                <Bell size={48} className="text-slate-600" />
              </div>
              <div>
                <p className="text-slate-300 font-medium">No notifications</p>
                <p className="text-slate-500 text-sm mt-1">You're all caught up!</p>
              </div>
            </div>
          ) : (
            sortedNotifications.map((notification) => {
              const severityClasses = getSeverityColor(notification.severity);
              const colorBg = severityClasses.split(' ')[0];
              const colorText = severityClasses.split(' ')[1];
              
              return (
                <div 
                  key={notification.id} 
                  className={`relative group bg-slate-800/40 hover:bg-slate-800/80 rounded-2xl border border-slate-700/50 p-4 pl-5 overflow-hidden transition-all duration-200 cursor-pointer ${!notification.read ? 'bg-slate-800/60' : 'opacity-80'}`}
                  onClick={() => !notification.read && onMarkAsRead(notification.id)}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${colorBg}`} />
                  
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl bg-slate-900/50 ${colorText}`}>
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm font-semibold truncate pr-2 ${!notification.read ? 'text-slate-100' : 'text-slate-300'}`}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {notification.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                  </div>

                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDismiss(notification.id); }}
                      className="p-1.5 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      title="Dismiss"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  
                  {!notification.read && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-500 group-hover:opacity-0 transition-opacity" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationCenter;
