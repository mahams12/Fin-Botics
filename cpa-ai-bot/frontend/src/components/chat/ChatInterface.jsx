import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { Bot, Menu, X, Plus } from 'lucide-react';

const ChatInterface = () => {
  const { 
    messages, 
    isTyping, 
    sendMessage, 
    startNewChat, 
    suggestions,
    loading 
  } = useChat();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (message, attachments = []) => {
    try {
      await sendMessage(message, attachments);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleNewChat = () => {
    startNewChat();
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Chat Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bot className="w-6 h-6 text-primary-600" />
            <h2 className="font-semibold text-gray-900">AI Assistant</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleNewChat}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="New Chat"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Quick Suggestions */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Questions</h3>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full p-3 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Chats - Placeholder */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Chats</h3>
          <div className="space-y-2">
            <div className="p-2 text-sm text-gray-500 bg-gray-50 rounded-lg">
              Tax deduction questions
            </div>
            <div className="p-2 text-sm text-gray-500 bg-gray-50 rounded-lg">
              Expense categorization help
            </div>
            <div className="p-2 text-sm text-gray-500 bg-gray-50 rounded-lg">
              Quarterly tax planning
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">CPA AI Assistant</h1>
                  <p className="text-sm text-gray-500">
                    {isTyping ? 'Typing...' : 'Online'}
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleNewChat}
              className="btn btn-outline btn-sm"
            >
              New Chat
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            /* Welcome Message */
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to CPA AI Assistant
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                I'm here to help with your tax questions, expense categorization, 
                and financial planning. What would you like to know?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto">
                {suggestions.slice(0, 4).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="p-3 text-left text-sm bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <MessageList messages={messages} />
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 bg-white p-4">
          <MessageInput 
            onSendMessage={handleSendMessage}
            disabled={loading || isTyping}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;