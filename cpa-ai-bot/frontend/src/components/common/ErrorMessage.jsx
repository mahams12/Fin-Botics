import React from 'react';
import { AlertCircle, RefreshCw, Home, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ErrorMessage = ({ 
  message = 'Something went wrong', 
  type = 'error',
  showRetry = false,
  onRetry,
  showHome = false,
  showBack = false,
  fullPage = false,
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'info':
        return <AlertCircle className="w-6 h-6 text-blue-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-red-500" />;
    }
  };

  const getAlertClass = () => {
    switch (type) {
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      default:
        return 'alert-error';
    }
  };

  if (fullPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h1>
            <p className="text-gray-600">{message}</p>
          </div>

          <div className="space-y-4">
            {showRetry && onRetry && (
              <button
                onClick={onRetry}
                className="btn btn-primary w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
            )}

            {showHome && (
              <Link to="/" className="btn btn-outline w-full">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            )}

            {showBack && (
              <button
                onClick={() => window.history.back()}
                className="btn btn-ghost w-full"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Go Back
              </button>
            )}
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>
              Need help?{' '}
              <a href="/contact" className="text-primary-600 hover:text-primary-700">
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${getAlertClass()} ${className}`}>
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1">
          <p className="font-medium">{message}</p>
          
          {(showRetry || showHome || showBack) && (
            <div className="mt-3 flex items-center space-x-3">
              {showRetry && onRetry && (
                <button
                  onClick={onRetry}
                  className="text-sm font-medium hover:underline flex items-center"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Try again
                </button>
              )}
              
              {showHome && (
                <Link 
                  to="/" 
                  className="text-sm font-medium hover:underline flex items-center"
                >
                  <Home className="w-3 h-3 mr-1" />
                  Home
                </Link>
              )}
              
              {showBack && (
                <button
                  onClick={() => window.history.back()}
                  className="text-sm font-medium hover:underline flex items-center"
                >
                  <ChevronLeft className="w-3 h-3 mr-1" />
                  Back
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;