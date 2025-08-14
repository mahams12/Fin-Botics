import React, { useState, useRef } from 'react';
import { Send, Paperclip, Mic, X } from 'lucide-react';

const MessageInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // FIXED: Allow sending even if only attachments exist (no text required)
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message.trim(), attachments);
      setMessage('');
      setAttachments([]);
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      id: Date.now() + Math.random()
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  // FIXED: Implement proper voice recording functionality
  const handleVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            setAudioChunks(prev => [...prev, event.data]);
          }
        };
        
        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const audioFile = new File([audioBlob], `voice_${Date.now()}.wav`, { type: 'audio/wav' });
          
          // Add voice recording as attachment
          const voiceAttachment = {
            file: audioFile,
            name: audioFile.name,
            size: audioFile.size,
            type: audioFile.type,
            id: Date.now() + Math.random(),
            isVoice: true
          };
          
          setAttachments(prev => [...prev, voiceAttachment]);
          setAudioChunks([]);
          
          // Stop all tracks to release microphone
          stream.getTracks().forEach(track => track.stop());
        };
        
        setMediaRecorder(recorder);
        recorder.start();
        setIsRecording(true);
        
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access microphone. Please check your browser permissions.');
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className={`flex items-center space-x-2 rounded-lg p-2 ${
                attachment.isVoice ? 'bg-blue-100' : 'bg-gray-100'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {attachment.isVoice ? '🎤 ' : ''}{attachment.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(attachment.size)}
                </p>
              </div>
              <button
                onClick={() => removeAttachment(attachment.id)}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Message Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* File Attachment Button */}
        <div className="flex-shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.csv,.xlsx"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors disabled:opacity-50"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask about taxes, expenses, or financial planning..."
            disabled={disabled}
            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            rows="1"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          
          {/* Character count */}
          {message.length > 0 && (
            <div className="absolute bottom-1 left-2 text-xs text-gray-400">
              {message.length}/2000
            </div>
          )}
        </div>

        {/* Voice Recording Button */}
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={handleVoiceRecording}
            disabled={disabled}
            className={`p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors disabled:opacity-50 ${
              isRecording 
                ? 'bg-red-500 border-red-500 text-white animate-pulse' 
                : 'border-gray-300 hover:bg-gray-50 text-gray-600'
            }`}
            title={isRecording ? 'Stop recording' : 'Voice message'}
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>

        {/* Send Button - FIXED: Now allows sending with only attachments */}
        <div className="flex-shrink-0">
          <button
            type="submit"
            disabled={disabled || (message.trim() === '' && attachments.length === 0)}
            className="btn btn-primary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Recording Status */}
      {isRecording && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span>Recording voice message...</span>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMessage('What are the best tax deductions for my business?')}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          Tax deductions
        </button>
        <button
          type="button"
          onClick={() => setMessage('Help me categorize this expense')}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          Categorize expense
        </button>
        <button
          type="button"
          onClick={() => setMessage('Calculate my quarterly tax estimate')}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          Tax estimate
        </button>
      </div>
    </div>
  );
};

export default MessageInput;