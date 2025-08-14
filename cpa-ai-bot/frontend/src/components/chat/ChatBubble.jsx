import React from 'react';
import { Bot, User, ThumbsUp, ThumbsDown, Copy, Share, File, Image, Mic } from 'lucide-react';
import { formatTime } from '../../utils/dateUtils';

const ChatBubble = ({ message, isLast = false }) => {
  const isUser = message.sender === 'user';
  const isBot = message.sender === 'bot';

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.text);
  };

  const handleRateMessage = (rating) => {
    // Implement message rating logic
    console.log('Rating message:', message.id, rating);
  };

  const getFileIcon = (attachment) => {
    if (attachment.isVoice) {
      return <Mic className="w-4 h-4" />;
    }
    if (attachment.type?.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Check if message has content (text or attachments)
  const hasText = message.text && message.text.trim() !== '';
  const hasAttachments = message.attachments && message.attachments.length > 0;
  
  // Don't render if no content
  if (!hasText && !hasAttachments) {
    return null;
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`flex max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse' : 'flex-row'} space-x-3`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          {isUser ? (
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-gray-600" />
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Message Bubble */}
          <div
            className={`
              px-4 py-2 rounded-2xl text-sm
              ${isUser 
                ? 'bg-primary-600 text-white rounded-br-md' 
                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
              }
            `}
          >
            {/* Text Content - Only show if there's text */}
            {hasText && (
              <p className="whitespace-pre-wrap">{message.text}</p>
            )}
            
            {/* Attachments */}
            {hasAttachments && (
              <div className={`space-y-2 ${hasText ? 'mt-2' : ''}`}>
                {message.attachments.map((attachment, index) => (
                  <div 
                    key={index}
                    className={`
                      flex items-center space-x-2 p-2 rounded-lg border
                      ${isUser 
                        ? 'bg-primary-500 border-primary-400 text-primary-100' 
                        : 'bg-gray-50 border-gray-200 text-gray-700'
                      }
                    `}
                  >
                    {/* File Icon */}
                    <div className={`flex-shrink-0 ${isUser ? 'text-primary-100' : 'text-gray-500'}`}>
                      {getFileIcon(attachment)}
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${isUser ? 'text-primary-100' : 'text-gray-700'}`}>
                        {attachment.isVoice ? '🎤 Voice Message' : attachment.name}
                      </p>
                      {attachment.size && (
                        <p className={`text-xs ${isUser ? 'text-primary-200' : 'text-gray-500'}`}>
                          {formatFileSize(attachment.size)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Show placeholder text for file-only messages */}
            {!hasText && hasAttachments && (
              <p className={`text-xs italic ${isUser ? 'text-primary-200' : 'text-gray-500'}`}>
                {message.attachments.some(att => att.isVoice) 
                  ? 'Sent a voice message' 
                  : `Sent ${message.attachments.length} file${message.attachments.length > 1 ? 's' : ''}`
                }
              </p>
            )}
          </div>

          {/* Message Info */}
          <div className={`flex items-center mt-1 space-x-2 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <span className="text-xs text-gray-500">
              {formatTime(message.timestamp)}
            </span>
            
            {/* Bot Message Actions */}
            {isBot && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleCopyMessage}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                  title="Copy message"
                >
                  <Copy className="w-3 h-3 text-gray-400" />
                </button>
                
                <button
                  onClick={() => handleRateMessage('positive')}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                  title="Helpful"
                >
                  <ThumbsUp className="w-3 h-3 text-gray-400" />
                </button>
                
                <button
                  onClick={() => handleRateMessage('negative')}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                  title="Not helpful"
                >
                  <ThumbsDown className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {message.suggestions && message.suggestions.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="block px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-left"
                  onClick={() => {
                    // Handle suggestion click
                    console.log('Suggestion clicked:', suggestion);
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;