import React from 'react';
import { Bot } from 'lucide-react';

const Loading = ({ size = 'default', message = 'Loading...', fullScreen = false }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const textSizeClasses = {
    small: 'text-sm',
    default: 'text-base',
    large: 'text-lg'
  };

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Bot className="w-16 h-16 text-primary-600 mx-auto mb-4 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">CPA AI Bot</h2>
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center space-x-3">
      <div className={`border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin ${sizeClasses[size]}`} />
      {message && (
        <span className={`text-gray-600 ${textSizeClasses[size]}`}>
          {message}
        </span>
      )}
    </div>
  );
};

export default Loading;