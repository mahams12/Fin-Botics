from typing import List, Optional
from app.database.chat_db import ChatDatabase
from app.models.chat import ChatSession, Message
from app.services.ai_service import AIService
from app.services.expense_service import ExpenseService
import re
import logging

logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        self.chat_db = ChatDatabase()
        self.ai_service = AIService()
        self.expense_service = ExpenseService()

    async def create_session(self, user_id: str, title: str = "New Chat") -> ChatSession:
        """Create a new chat session"""
        return await self.chat_db.create_session(user_id, title)

    async def get_session(self, session_id: str, user_id: str) -> Optional[ChatSession]:
        """Get chat session by ID (with user verification)"""
        session = await self.chat_db.get_session_by_id(session_id)
        if session and str(session.user_id) == user_id:
            return session
        return None

    async def get_user_sessions(self, user_id: str) -> List[ChatSession]:
        """Get all sessions for a user"""
        return await self.chat_db.get_user_sessions(user_id)

    async def process_message(self, session_id: str, user_id: str, message: str) -> dict:
        """Process user message and return bot response"""
        try:
            # Add user message to session
            await self.chat_db.add_message(session_id, user_id, message, is_user=True)

            # Check if message is expense-related
            expense_result = await self._handle_expense_message(user_id, message)
            if expense_result:
                # Add bot response about expense
                bot_response = expense_result["response"]
                await self.chat_db.add_message(session_id, user_id, bot_response, is_user=False)
                
                return {
                    "response": bot_response,
                    "type": "expense",
                    "data": expense_result.get("data")
                }

            # Get session context for AI
            context = await self._get_session_context(session_id)
            
            # Process with AI
            bot_response = await self.ai_service.process_chat_message(message, context)
            
            # Add bot response to session
            await self.chat_db.add_message(session_id, user_id, bot_response, is_user=False)

            return {
                "response": bot_response,
                "type": "chat"
            }

        except Exception as e:
            logger.error(f"Error processing message: {e}")
            error_response = "I'm sorry, I encountered an error processing your message. Please try again."
            await self.chat_db.add_message(session_id, user_id, error_response, is_user=False)
            
            return {
                "response": error_response,
                "type": "error"
            }

    async def _handle_expense_message(self, user_id: str, message: str) -> Optional[dict]:
        """Check if message is expense-related and handle it"""
        # Keywords that indicate expense logging
        expense_keywords = ['paid', 'spent', 'bought', 'expense', 'cost', 'purchased', '$']
        
        if any(keyword in message.lower() for keyword in expense_keywords):
            result = await self.expense_service.create_expense_from_text(user_id, message)
            
            if result["success"]:
                expense = result["expense"]
                categorization = result["categorization"]
                
                response = f"""✅ Expense logged successfully!
                
**Amount:** ${expense.amount:.2f}
**Description:** {expense.description}
**Category:** {expense.category.replace('_', ' ').title()}
**Date:** {expense.date.strftime('%Y-%m-%d')}

{categorization['explanation']}

Is this categorization correct? You can always update it later."""

                return {
                    "response": response,
                    "data": {
                        "expense_id": str(expense.id),
                        "category": expense.category,
                        "amount": expense.amount
                    }
                }
            else:
                return {
                    "response": f"I couldn't process that expense. {result['error']}. {result.get('suggestion', '')}"
                }
        
        return None

    async def _get_session_context(self, session_id: str, limit: int = 5) -> str:
        """Get recent messages for context"""
        messages = await self.chat_db.get_session_messages(session_id, limit=limit)
        
        if not messages:
            return ""
        
        context_lines = []
        for msg in messages[-limit:]:  # Get last few messages
            role = "User" if msg.is_user else "Assistant"
            context_lines.append(f"{role}: {msg.content}")
        
        return "\n".join(context_lines)