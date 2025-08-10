import { apiMethods, buildUrl } from './api';

export const chatService = {
  // Send message to AI
  sendMessage: async (messageData) => {
    const response = await apiMethods.post('/chat/message', messageData);
    return response;
  },

  // Get chat history
  getChatHistory: async (filters = {}) => {
    const url = buildUrl('/chat/history', filters);
    const response = await apiMethods.get(url);
    return response;
  },

  // Get specific chat
  getChat: async (chatId) => {
    const response = await apiMethods.get(`/chat/${chatId}`);
    return response;
  },

  // Create new chat
  createChat: async (title = 'New Chat') => {
    const response = await apiMethods.post('/chat', { title });
    return response;
  },

  // Update chat title
  updateChatTitle: async (chatId, title) => {
    const response = await apiMethods.put(`/chat/${chatId}`, { title });
    return response;
  },

  // Delete chat
  deleteChat: async (chatId) => {
    const response = await apiMethods.delete(`/chat/${chatId}`);
    return response;
  },

  // Clear all chats
  clearAllChats: async () => {
    const response = await apiMethods.delete('/chat/all');
    return response;
  },

  // Get message by ID
  getMessage: async (messageId) => {
    const response = await apiMethods.get(`/chat/message/${messageId}`);
    return response;
  },

  // Update message
  updateMessage: async (messageId, content) => {
    const response = await apiMethods.put(`/chat/message/${messageId}`, {
      content,
    });
    return response;
  },

  // Delete message
  deleteMessage: async (messageId) => {
    const response = await apiMethods.delete(`/chat/message/${messageId}`);
    return response;
  },

  // Rate message (thumbs up/down)
  rateMessage: async (messageId, rating) => {
    const response = await apiMethods.post(`/chat/message/${messageId}/rate`, {
      rating, // 'positive' or 'negative'
    });
    return response;
  },

  // Report message
  reportMessage: async (messageId, reason) => {
    const response = await apiMethods.post(`/chat/message/${messageId}/report`, {
      reason,
    });
    return response;
  },

  // Upload file to chat
  uploadFile: async (file, chatId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (chatId) {
      formData.append('chat_id', chatId);
    }

    const response = await apiMethods.upload('/chat/upload', formData);
    return response;
  },

  // Get file info
  getFileInfo: async (fileId) => {
    const response = await apiMethods.get(`/chat/file/${fileId}`);
    return response;
  },

  // Delete uploaded file
  deleteFile: async (fileId) => {
    const response = await apiMethods.delete(`/chat/file/${fileId}`);
    return response;
  },

  // Export chat
  exportChat: async (chatId, format = 'json') => {
    const response = await apiMethods.download(`/chat/${chatId}/export`, {
      params: { format }
    });
    return response;
  },

  // Share chat
  shareChat: async (chatId, permissions = 'read') => {
    const response = await apiMethods.post(`/chat/${chatId}/share`, {
      permissions,
    });
    return response;
  },

  // Get shared chat
  getSharedChat: async (shareToken) => {
    const response = await apiMethods.get(`/chat/shared/${shareToken}`);
    return response;
  },

  // Search messages
  searchMessages: async (query, filters = {}) => {
    const params = { query, ...filters };
    const url = buildUrl('/chat/search', params);
    const response = await apiMethods.get(url);
    return response;
  },

  // Get chat statistics
  getChatStats: async (dateRange = {}) => {
    const url = buildUrl('/chat/stats', dateRange);
    const response = await apiMethods.get(url);
    return response;
  },

  // Get suggested responses
  getSuggestions: async (context) => {
    const response = await apiMethods.post('/chat/suggestions', {
      context,
    });
    return response;
  },

  // Get chat templates
  getTemplates: async () => {
    const response = await apiMethods.get('/chat/templates');
    return response;
  },

  // Create chat from template
  createFromTemplate: async (templateId, variables = {}) => {
    const response = await apiMethods.post(`/chat/templates/${templateId}/create`, {
      variables,
    });
    return response;
  },

  // Regenerate AI response
  regenerateResponse: async (messageId) => {
    const response = await apiMethods.post(`/chat/message/${messageId}/regenerate`);
    return response;
  },

  // Set chat preferences
  setChatPreferences: async (preferences) => {
    const response = await apiMethods.put('/chat/preferences', preferences);
    return response;
  },

  // Get chat preferences
  getChatPreferences: async () => {
    const response = await apiMethods.get('/chat/preferences');
    return response;
  },

  // Start typing indicator
  startTyping: async (chatId) => {
    const response = await apiMethods.post(`/chat/${chatId}/typing`);
    return response;
  },

  // Stop typing indicator
  stopTyping: async (chatId) => {
    const response = await apiMethods.delete(`/chat/${chatId}/typing`);
    return response;
  },

  // Get typing status
  getTypingStatus: async (chatId) => {
    const response = await apiMethods.get(`/chat/${chatId}/typing`);
    return response;
  },
};