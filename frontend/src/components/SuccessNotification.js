import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

const SuccessNotification = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out animate-slide-in">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center max-w-sm">
        <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
        <span className="font-medium">{message}</span>
        <button 
          onClick={onClose} 
          className="ml-3 text-white hover:text-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SuccessNotification;
