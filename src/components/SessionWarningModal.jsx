import React from 'react';
import { Clock, LogOut } from 'lucide-react';

const SessionWarningModal = ({ isVisible, remainingSeconds, onContinue, onLogout }) => {
  if (!isVisible) return null;

  const isUrgent = remainingSeconds <= 30;
  
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center transform scale-100 animate-in fade-in zoom-in duration-200">
        
        {/* Icon & Pulse ring */}
        <div className="relative mb-6">
          {isUrgent && (
            <div className="absolute inset-0 bg-amber-500/30 rounded-full animate-ping" />
          )}
          <div className={`relative p-4 rounded-full bg-gradient-to-br ${isUrgent ? 'from-amber-500 to-orange-600' : 'from-slate-700 to-slate-800'} shadow-lg`}>
            <Clock className="text-white" size={32} />
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-2">Session Expiring Soon</h2>
        <p className="text-sm text-slate-400 mb-6">
          Your session will expire due to inactivity. Click Continue to stay logged in.
        </p>

        <div className={`text-5xl font-black mb-8 font-mono tracking-tighter ${isUrgent ? 'text-amber-500 animate-pulse' : 'text-white'}`}>
          {formatTime(remainingSeconds)}
        </div>

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={onContinue}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25"
          >
            Continue Working
          </button>
          
          <button
            onClick={onLogout}
            className="w-full py-3 px-4 flex items-center justify-center gap-2 bg-transparent border border-slate-700 hover:border-red-500/50 hover:bg-red-500/10 text-slate-300 hover:text-red-400 font-medium rounded-xl transition-all"
          >
            <LogOut size={16} />
            Log Out Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionWarningModal;
