import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { chatService } from '../services/chatService';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

// Helper function to extract error message from various error formats
const getErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    // Handle API response errors
    if (error.response?.data) {
      const responseData = error.response.data;
      
      // Handle validation errors from FastAPI/Pydantic
      if (responseData.detail && Array.isArray(responseData.detail)) {
        // Extract the first validation error message
        const firstError = responseData.detail[0];
        if (firstError && firstError.msg) {
          return firstError.msg;
        }
        if (typeof firstError === 'string') {
          return firstError;
        }
      }
      
      // Handle single detail message
      if (typeof responseData.detail === 'string') {
        return responseData.detail;
      }
      
      // Handle other error formats
      if (responseData.message) return responseData.message;
      if (responseData.error) return responseData.error;
    }
    
    // Handle direct error object properties
    if (error.message) return error.message;
    if (error.msg) return error.msg;
    if (error.detail) return error.detail;
    
    // Last resort: stringify the error
    return JSON.stringify(error);
  }
  
  return 'An unknown error occurred';
};

// Initial state
const initialState = {
  messages: [],
  isTyping: false,
  loading: false,
  error: null,
  currentChatId: null,
  chatHistory: [],
  suggestions: [
    "What are my biggest tax deductions this year?",
    "Help me categorize my business expenses",
    "Calculate my estimated quarterly taxes",
    "What receipts should I keep for tax purposes?",
  ],
};

// Action types
const CHAT_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_TYPING: 'SET_TYPING',
  SET_ERROR: 'SET_ERROR',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_LAST_MESSAGE: 'UPDATE_LAST_MESSAGE',
  SET_MESSAGES: 'SET_MESSAGES',
  CLEAR_MESSAGES: 'CLEAR_MESSAGES',
  SET_CURRENT_CHAT: 'SET_CURRENT_CHAT',
  SET_CHAT_HISTORY: 'SET_CHAT_HISTORY',
  ADD_TO_HISTORY: 'ADD_TO_HISTORY',
  REMOVE_FROM_HISTORY: 'REMOVE_FROM_HISTORY',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer function
const chatReducer = (state, action) => {
  switch (action.type) {
    case CHAT_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case CHAT_ACTIONS.SET_TYPING:
      return {
        ...state,
        isTyping: action.payload,
      };
    case CHAT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
        isTyping: false,
      };
    case CHAT_ACTIONS.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case CHAT_ACTIONS.UPDATE_LAST_MESSAGE:
      return {
        ...state,
        messages: state.messages.map((msg, index) =>
          index === state.messages.length - 1
            ? { ...msg, ...action.payload }
            : msg
        ),
      };
    case CHAT_ACTIONS.SET_MESSAGES:
      return {
        ...state,
        messages: action.payload,
      };
    case CHAT_ACTIONS.CLEAR_MESSAGES:
      return {
        ...state,
        messages: [],
        currentChatId: null,
      };
    case CHAT_ACTIONS.SET_CURRENT_CHAT:
      return {
        ...state,
        currentChatId: action.payload,
      };
    case CHAT_ACTIONS.SET_CHAT_HISTORY:
      return {
        ...state,
        chatHistory: action.payload,
      };
    case CHAT_ACTIONS.ADD_TO_HISTORY:
      return {
        ...state,
        chatHistory: [action.payload, ...state.chatHistory],
      };
    case CHAT_ACTIONS.REMOVE_FROM_HISTORY:
      return {
        ...state,
        chatHistory: state.chatHistory.filter(chat => chat.id !== action.payload),
      };
    case CHAT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const ChatContext = createContext();

// Chat provider component
export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { logout } = useAuth();

  // Handle authentication errors
  const handleAuthError = useCallback((error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Authentication error in chat, logging out...');
      logout();
      return true; // Indicates auth error was handled
    }
    return false; // Not an auth error
  }, [logout]);

  // Send message function - FIXED for backend API
  const sendMessage = useCallback(async (messageText, attachments = []) => {
    // FIXED: Allow sending if there's text OR attachments
    if (!messageText.trim() && (!attachments || attachments.length === 0)) return;

    try {
      // Add user message immediately
      const userMessage = {
        id: Date.now().toString(),
        text: messageText,
        sender: 'user',
        timestamp: new Date().toISOString(),
        attachments,
      };

      dispatch({ type: CHAT_ACTIONS.ADD_MESSAGE, payload: userMessage });
      dispatch({ type: CHAT_ACTIONS.SET_TYPING, payload: true });
      dispatch({ type: CHAT_ACTIONS.CLEAR_ERROR });

      // Send to backend API
      const response = await chatService.sendMessage({
        message: messageText,
        chatId: state.currentChatId, // This will be session_id for backend
        attachments, // Backend doesn't support this yet
      });

      console.log('✅ Backend response:', response);

      // Add bot response - backend returns different format
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response.response, // Backend returns 'response' field
        sender: 'bot',
        timestamp: new Date().toISOString(),
        suggestions: [], // Backend doesn't return suggestions yet
      };

      dispatch({ type: CHAT_ACTIONS.ADD_MESSAGE, payload: botMessage });

      // Update current chat ID if it's a new chat
      if (response.session_id && !state.currentChatId) {
        dispatch({ type: CHAT_ACTIONS.SET_CURRENT_CHAT, payload: response.session_id });
      }

      // Reload chat history to get updated list
      loadChatHistory();

      console.log('✅ Message sent successfully');

    } catch (error) {
      console.error('❌ Send message error:', error);
      
      // Check if it's an authentication error
      if (handleAuthError(error)) {
        return; // Auth error handled, user will be redirected to login
      }

      // Handle other errors
      const errorMessage = getErrorMessage(error);
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: CHAT_ACTIONS.SET_TYPING, payload: false });
    }
  }, [state.currentChatId, handleAuthError]);

  // Load chat history - IMPROVED with better debugging and data handling
  const loadChatHistory = useCallback(async () => {
    try {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });
      const sessions = await chatService.getChatHistory();
      
      console.log('🔍 Raw backend response:', sessions);
      console.log('🔍 Response type:', typeof sessions);
      console.log('🔍 Is array:', Array.isArray(sessions));
      
      // Handle different response formats
      let sessionsArray = sessions;
      if (sessions && sessions.data) {
        sessionsArray = sessions.data;
      } else if (!Array.isArray(sessions)) {
        console.warn('⚠️ Unexpected response format:', sessions);
        sessionsArray = [];
      }
      
      console.log('📋 Sessions array:', sessionsArray);
      
      // Transform backend format to frontend format with better handling
      const formattedHistory = sessionsArray.map((session, index) => {
        console.log(`🔍 Processing session ${index}:`, session);
        
        // Extract session ID - try different field names
        const sessionId = session.session_id || session.id || session._id || `session_${index}`;
        
        // Extract title with fallback
        let title = session.title || 'Untitled Chat';
        if (title === 'New Chat' && session.created_at) {
          // Create more descriptive title from date
          const date = new Date(session.created_at);
          title = `Chat ${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        }
        
        // Extract dates with proper handling
        const createdAt = session.created_at || new Date().toISOString();
        const updatedAt = session.updated_at || session.created_at || new Date().toISOString();
        
        return {
          id: sessionId,
          title: title,
          firstMessage: session.first_message || title,
          lastMessage: session.last_message || title,
          createdAt: createdAt,
          updatedAt: updatedAt,
          messageCount: session.message_count || 0
        };
      });
      
      console.log('✅ Formatted history:', formattedHistory);
      
      // Sort by updated date (newest first)
      formattedHistory.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      
      dispatch({ type: CHAT_ACTIONS.SET_CHAT_HISTORY, payload: formattedHistory });
      
    } catch (error) {
      console.error('❌ Load chat history error:', error);
      console.error('❌ Error details:', error.response?.data);
      
      // Check if it's an authentication error
      if (handleAuthError(error)) {
        return; // Auth error handled
      }

      const errorMessage = getErrorMessage(error);
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: errorMessage });
    } finally {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: false });
    }
  }, [handleAuthError]);

  // Load specific chat - FIXED for backend API
  const loadChat = useCallback(async (chatId) => {
    try {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });
      const chatData = await chatService.getChat(chatId);
      
      console.log('✅ Chat data loaded:', chatData);
      
      // Transform backend message format to frontend format
      const formattedMessages = chatData.messages.map(msg => ({
        id: msg.id,
        text: msg.content, // Backend uses 'content', frontend expects 'text'
        sender: msg.is_user ? 'user' : 'bot', // Backend uses is_user boolean
        timestamp: msg.timestamp,
        attachments: [] // Backend doesn't support attachments yet
      }));
      
      dispatch({ type: CHAT_ACTIONS.SET_MESSAGES, payload: formattedMessages });
      dispatch({ type: CHAT_ACTIONS.SET_CURRENT_CHAT, payload: chatId });
    } catch (error) {
      console.error('❌ Load chat error:', error);
      
      // Check if it's an authentication error
      if (handleAuthError(error)) {
        return; // Auth error handled
      }

      const errorMessage = getErrorMessage(error);
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: false });
    }
  }, [handleAuthError]);

  // Start new chat
  const startNewChat = useCallback(() => {
    dispatch({ type: CHAT_ACTIONS.CLEAR_MESSAGES });
    dispatch({ type: CHAT_ACTIONS.CLEAR_ERROR });
  }, []);

  // Delete chat - IMPROVED with better error handling
  const deleteChat = useCallback(async (chatId) => {
    try {
      console.log('🗑️ Attempting to delete chat:', chatId);
      
      const response = await chatService.deleteChat(chatId);
      console.log('✅ Delete response:', response);
      
      dispatch({ type: CHAT_ACTIONS.REMOVE_FROM_HISTORY, payload: chatId });
      
      // If deleting current chat, clear messages
      if (chatId === state.currentChatId) {
        dispatch({ type: CHAT_ACTIONS.CLEAR_MESSAGES });
      }
      
      toast.success('Chat deleted successfully');
      
      // Reload chat history to get fresh data
      await loadChatHistory();
      
    } catch (error) {
      console.error('❌ Delete chat error:', error);
      console.error('❌ Delete error details:', error.response?.data);
      
      // Check if it's an authentication error
      if (handleAuthError(error)) {
        return; // Auth error handled
      }

      const errorMessage = getErrorMessage(error);
      console.error('❌ Delete error message:', errorMessage);
      
      // Show more specific error messages
      if (error.response?.status === 404) {
        toast.error('Chat not found - it may have already been deleted');
      } else {
        toast.error(`Failed to delete chat: ${errorMessage}`);
      }
    }
  }, [state.currentChatId, handleAuthError, loadChatHistory]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: CHAT_ACTIONS.CLEAR_ERROR });
  }, []);

  // Context value
  const value = {
    ...state,
    sendMessage,
    loadChatHistory,
    loadChat,
    startNewChat,
    deleteChat,
    clearError,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use chat context
export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;