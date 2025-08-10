import React from 'react';
import Header from '../components/common/Header';
import ChatInterface from '../components/chat/ChatInterface';

const ChatPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-16">
        <ChatInterface />
      </div>
    </div>
  );
};

export default ChatPage;