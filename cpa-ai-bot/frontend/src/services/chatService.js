import { apiMethods, buildUrl } from './api';

export const chatService = {
  // Send message to AI - FIXED to match backend
  sendMessage: async (messageData) => {
    const response = await apiMethods.post('/chat/message', {
      message: messageData.message,
      session_id: messageData.chatId // Backend expects session_id
    });
    return response;
  },

  // Get chat history - FIXED to match backend API
  getChatHistory: async (filters = {}) => {
    // Backend endpoint is /chat/sessions
    const response = await apiMethods.get('/chat/sessions');
    return response;
  },

  // Get specific chat - FIXED to match backend API
  getChat: async (chatId) => {
    // Backend endpoint is /chat/sessions/{session_id}/history
    const response = await apiMethods.get(`/chat/sessions/${chatId}/history`);
    return response;
  },

  // Create new chat - FIXED to match backend
  createChat: async (title = 'New Chat') => {
    const response = await apiMethods.post('/chat/sessions', null, {
      params: { title }
    });
    return response;
  },

  // Update chat title - Backend doesn't have this endpoint yet
  updateChatTitle: async (chatId, title) => {
    // TODO: Backend needs PUT /chat/sessions/{session_id} endpoint
    console.warn('Update chat title not implemented in backend yet');
    return { success: false };
  },

  // Delete chat - SIMPLE FIX using existing apiMethods
  deleteChat: async (chatId) => {
    const response = await apiMethods.delete(`/chat/sessions/${chatId}`);
    return response;
  },

  // Clear all chats - Backend doesn't have this endpoint
  clearAllChats: async () => {
    console.warn('Clear all chats not implemented in backend yet');
    return { success: false };
  },

  // Get message by ID - Backend doesn't have this endpoint
  getMessage: async (messageId) => {
    console.warn('Get message by ID not implemented in backend yet');
    return null;
  },

  // Update message - Backend doesn't have this endpoint
  updateMessage: async (messageId, content) => {
    console.warn('Update message not implemented in backend yet');
    return { success: false };
  },

  // Delete message - Backend doesn't have this endpoint
  deleteMessage: async (messageId) => {
    console.warn('Delete message not implemented in backend yet');
    return { success: false };
  },

  // Rate message - Backend doesn't have this endpoint
  rateMessage: async (messageId, rating) => {
    console.warn('Rate message not implemented in backend yet');
    return { success: false };
  },

  // Report message - Backend doesn't have this endpoint
  reportMessage: async (messageId, reason) => {
    console.warn('Report message not implemented in backend yet');
    return { success: false };
  },

  // Upload file to chat - Backend doesn't have this endpoint
  uploadFile: async (file, chatId = null) => {
    console.warn('File upload not implemented in backend yet');
    return { success: false };
  },

  // Get file info - Backend doesn't have this endpoint
  getFileInfo: async (fileId) => {
    console.warn('Get file info not implemented in backend yet');
    return null;
  },

  // Delete uploaded file - Backend doesn't have this endpoint
  deleteFile: async (fileId) => {
    console.warn('Delete file not implemented in backend yet');
    return { success: false };
  },

  // Export chat - Backend doesn't have this endpoint
  exportChat: async (chatId, format = 'json') => {
    console.warn('Export chat not implemented in backend yet');
    return null;
  },

  // Share chat - Backend doesn't have this endpoint
  shareChat: async (chatId, permissions = 'read') => {
    console.warn('Share chat not implemented in backend yet');
    return { success: false };
  },

  // Get shared chat - Backend doesn't have this endpoint
  getSharedChat: async (shareToken) => {
    console.warn('Get shared chat not implemented in backend yet');
    return null;
  },

  // Search messages - Backend doesn't have this endpoint
  searchMessages: async (query, filters = {}) => {
    console.warn('Search messages not implemented in backend yet');
    return [];
  },

  // Get chat statistics - Backend doesn't have this endpoint
  getChatStats: async (dateRange = {}) => {
    console.warn('Chat stats not implemented in backend yet');
    return {};
  },

  // Get suggested responses - Backend doesn't have this endpoint
  getSuggestions: async (context) => {
    console.warn('Get suggestions not implemented in backend yet');
    return [];
  },

  // Get chat templates - Backend doesn't have this endpoint
  getTemplates: async () => {
    console.warn('Chat templates not implemented in backend yet');
    return [];
  },

  // Create chat from template - Backend doesn't have this endpoint
  createFromTemplate: async (templateId, variables = {}) => {
    console.warn('Create from template not implemented in backend yet');
    return { success: false };
  },

  // Regenerate AI response - Backend doesn't have this endpoint
  regenerateResponse: async (messageId) => {
    console.warn('Regenerate response not implemented in backend yet');
    return { success: false };
  },

  // Set chat preferences - Backend doesn't have this endpoint
  setChatPreferences: async (preferences) => {
    console.warn('Chat preferences not implemented in backend yet');
    return { success: false };
  },

  // Get chat preferences - Backend doesn't have this endpoint
  getChatPreferences: async () => {
    console.warn('Get chat preferences not implemented in backend yet');
    return {};
  },

  // Start typing indicator - Backend doesn't have this endpoint
  startTyping: async (chatId) => {
    console.warn('Typing indicator not implemented in backend yet');
    return { success: false };
  },

  // Stop typing indicator - Backend doesn't have this endpoint
  stopTyping: async (chatId) => {
    console.warn('Stop typing not implemented in backend yet');
    return { success: false };
  },

  // Get typing status - Backend doesn't have this endpoint
  getTypingStatus: async (chatId) => {
    console.warn('Get typing status not implemented in backend yet');
    return { isTyping: false };
  },
};