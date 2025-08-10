import React from 'react';
import ChatBubble from './ChatBubble';

const MessageList = ({ messages = [] }) => {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <ChatBubble 
          key={message.id || index}
          message={message}
          isLast={index === messages.length - 1}
        />
      ))}
    </div>
  );
};

export default MessageList;