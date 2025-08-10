import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { chatService } from '../services/chatService';
import toast from 'react-hot-toast';

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

      // Add bot response
      const botMessage = {
        id: response.messageId || (Date.now() + 1).toString(),
        text: response.message,
        sender: 'bot',
        timestamp: response.timestamp || new Date().toISOString(),
        suggestions: response.suggestions || [],
      };

      dispatch({ type: CHAT_ACTIONS.ADD_MESSAGE, payload: botMessage });

      // Update current chat ID if it's a new chat
      if (response.chatId && !state.currentChatId) {
        dispatch({ type: CHAT_ACTIONS.SET_CURRENT_CHAT, payload: response.chatId });
      }

    } catch (error) {
      console.error('Send message error:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to send message';
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: CHAT_ACTIONS.SET_TYPING, payload: false });
    }
  }, [state.currentChatId]);

  // Load chat history
  const loadChatHistory = useCallback(async () => {
    try {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });
      const history = await chatService.getChatHistory();
      dispatch({ type: CHAT_ACTIONS.SET_CHAT_HISTORY, payload: history });
    } catch (error) {
      console.error('Load chat history error:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to load chat history';
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: errorMessage });
    } finally {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // Load specific chat
  const loadChat = useCallback(async (chatId) => {
    try {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });
      const chatData = await chatService.getChat(chatId);
      dispatch({ type: CHAT_ACTIONS.SET_MESSAGES, payload: chatData.messages });
      dispatch({ type: CHAT_ACTIONS.SET_CURRENT_CHAT, payload: chatId });
    } catch (error) {
      console.error('Load chat error:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to load chat';
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

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
      const errorMessage = error.response?.data?.detail || 'Failed to delete chat';
      toast.error(errorMessage);
    }
  }, [state.currentChatId]);

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