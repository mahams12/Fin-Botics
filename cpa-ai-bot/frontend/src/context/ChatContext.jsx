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

  // Send message function
  const sendMessage = useCallback(async (messageText, attachments = []) => {
    if (!messageText.trim()) return;

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

      // Send to API
      const response = await chatService.sendMessage({
        message: messageText,
        chatId: state.currentChatId,
        attachments,
      });

      // DEBUG: Log the entire response to see its structure
      console.log('🔍 Full API response:', response);
      console.log('🔍 Response keys:', Object.keys(response));
      console.log('🔍 Response.message:', response.message);
      console.log('🔍 Response.response:', response.response);
      console.log('🔍 Response.content:', response.content);
      console.log('🔍 Response.text:', response.text);
      console.log('🔍 Response.ai_response:', response.ai_response);
      console.log('🔍 Response.data:', response.data);

      // Try different possible field names for the AI message
      const aiMessageText = response.message || 
                            response.response || 
                            response.content || 
                            response.text || 
                            response.ai_response ||
                            response.data?.message ||
                            response.data?.response ||
                            response.data?.content ||
                            'No response received from AI';

      console.log('🤖 AI message text extracted:', aiMessageText);

      // Add bot response
      const botMessage = {
        id: response.messageId || response.id || response.data?.id || (Date.now() + 1).toString(),
        text: aiMessageText,
        sender: 'bot',
        timestamp: response.timestamp || response.data?.timestamp || new Date().toISOString(),
        suggestions: response.suggestions || response.data?.suggestions || [],
      };

      console.log('🤖 Bot message to add:', botMessage);

      dispatch({ type: CHAT_ACTIONS.ADD_MESSAGE, payload: botMessage });

      // Update current chat ID if it's a new chat
      if (response.chatId && !state.currentChatId) {
        dispatch({ type: CHAT_ACTIONS.SET_CURRENT_CHAT, payload: response.chatId });
      }

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

  // Load chat history
  const loadChatHistory = useCallback(async () => {
    try {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });
      const history = await chatService.getChatHistory();
      dispatch({ type: CHAT_ACTIONS.SET_CHAT_HISTORY, payload: history });
    } catch (error) {
      console.error('Load chat history error:', error);
      
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

  // Load specific chat
  const loadChat = useCallback(async (chatId) => {
    try {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });
      const chatData = await chatService.getChat(chatId);
      dispatch({ type: CHAT_ACTIONS.SET_MESSAGES, payload: chatData.messages });
      dispatch({ type: CHAT_ACTIONS.SET_CURRENT_CHAT, payload: chatId });
    } catch (error) {
      console.error('Load chat error:', error);
      
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

  // Delete chat
  const deleteChat = useCallback(async (chatId) => {
    try {
      await chatService.deleteChat(chatId);
      dispatch({ type: CHAT_ACTIONS.REMOVE_FROM_HISTORY, payload: chatId });
      
      // If deleting current chat, clear messages
      if (chatId === state.currentChatId) {
        dispatch({ type: CHAT_ACTIONS.CLEAR_MESSAGES });
      }
      
      toast.success('Chat deleted successfully');
    } catch (error) {
      console.error('Delete chat error:', error);
      
      // Check if it's an authentication error
      if (handleAuthError(error)) {
        return; // Auth error handled
      }

      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  }, [state.currentChatId, handleAuthError]);

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