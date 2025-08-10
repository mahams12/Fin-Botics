import React from 'react';
import { Bot } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="flex space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-gray-600" />
          </div>
        </div>

        {/* Typing Animation */}
        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
          <div className="flex items-center space-x-1">
            <span className="text-gray-500 text-sm mr-2">AI is thinking</span>
            <div className="typing-dots">
              <span className="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
              <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mx-1"></span>
              <span className="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;