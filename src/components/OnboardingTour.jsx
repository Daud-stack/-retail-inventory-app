import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';

const steps = [
  {
    title: 'Welcome to NexusRetail',
    content: 'Get started with your role-based dashboard for an overview of your retail operations.',
    icon: Sparkles
  },
  {
    title: 'POS & Checkout',
    content: 'Process fast sales, handle multiple currencies, and print receipts seamlessly.',
    icon: Sparkles
  },
  {
    title: 'Product Catalog & Barcodes',
    content: 'Easily manage stock entries and utilize barcode scanning for quick product lookups.',
    icon: Sparkles
  },
  {
    title: 'Real-Time Notifications',
    content: 'Stay informed with instant alerts for low stock levels and expiring products.',
    icon: Sparkles
  },
  {
    title: 'Reports & Audit Trail',
    content: 'Generate ZIMRA compliant Z-reports and maintain a secure audit trail for all actions.',
    icon: Sparkles
  }
];

const OnboardingTour = ({ isOpen, onClose, userRole }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('nexus_onboarding_completed', 'true');
    onClose();
  };

  if (!isOpen) return null;

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-2xl shadow-indigo-900/20 text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-indigo-400">
            <StepIcon size={20} />
            <span className="font-semibold tracking-wide uppercase text-xs">
              Guided Tour • Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <button 
            onClick={handleComplete}
            className="p-1 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
            title="Skip Tour"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            {steps[currentStep].title}
          </h2>
          <p className="text-slate-400 leading-relaxed min-h-[4rem]">
            {steps[currentStep].content}
          </p>
        </div>

        {/* Footer & Controls */}
        <div className="flex items-center justify-between px-6 py-5 bg-slate-900/50 border-t border-slate-800">
          
          {/* Dots Indicator */}
          <div className="flex gap-2">
            {steps.map((_, idx) => (
              <div 
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep 
                    ? 'w-6 bg-indigo-500' 
                    : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleComplete}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Skip
            </button>
            
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all active:scale-95"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Get Started
                  <Check size={18} />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
