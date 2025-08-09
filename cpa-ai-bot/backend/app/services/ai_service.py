import openai
from typing import Optional, Dict, Any
from app.config.settings import settings
import re
import logging

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

    async def process_chat_message(self, message: str, context: str = "") -> str:
        """Process chat message with AI"""
        try:
            system_prompt = """You are a helpful CPA AI assistant. You help with:
            - Answering accounting and tax questions
            - Expense categorization
            - Tax estimation guidance
            - Financial advice for small businesses
            
            Keep responses clear, helpful, and professional. Always mention this is general guidance and recommend consulting a CPA for specific situations."""

            messages = [
                {"role": "system", "content": system_prompt},
            ]
            
            if context:
                messages.append({"role": "system", "content": f"Context: {context}"})
            
            messages.append({"role": "user", "content": message})

            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"AI service error: {e}")
            return "I'm sorry, I'm having trouble processing your request right now. Please try again later."

    async def categorize_expense(self, description: str, amount: float) -> Dict[str, Any]:
        """Categorize expense using AI"""
        try:
            prompt = f"""
            Categorize this business expense:
            Description: {description}
            Amount: ${amount}
            
            Choose from these categories:
            - office_supplies
            - marketing
            - travel
            - meals
            - utilities
            - software
            - professional_services
            - other
            
            Respond with just the category name and a brief explanation.
            Format: category_name | explanation
            """

            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=100,
                temperature=0.3
            )
            
            result = response.choices[0].message.content.strip()
            
            # Parse response
            if "|" in result:
                category, explanation = result.split("|", 1)
                return {
                    "category": category.strip(),
                    "explanation": explanation.strip(),
                    "confidence": 0.8
                }
            else:
                return {
                    "category": "other",
                    "explanation": "Could not categorize automatically",
                    "confidence": 0.3
                }
                
        except Exception as e:
            logger.error(f"Expense categorization error: {e}")
            return {
                "category": "other",
                "explanation": "Error in categorization",
                "confidence": 0.0
            }

    async def parse_expense_from_text(self, text: str) -> Optional[Dict[str, Any]]:
        """Extract expense information from natural language text"""
        try:
            prompt = f"""
            Extract expense information from this text: "{text}"
            
            Return in this exact format:
            amount: [number only]
            description: [brief description]
            
            If no clear amount or description found, return "none" for that field.
            """

            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150,
                temperature=0.3
            )
            
            result = response.choices[0].message.content.strip()
            
            # Parse the response
            lines = result.split('\n')
            expense_data = {}
            
            for line in lines:
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip().lower()
                    value = value.strip()
                    
                    if key == 'amount' and value != 'none':
                        # Extract number from amount
                        amount_match = re.findall(r'\d+\.?\d*', value)
                        if amount_match:
                            expense_data['amount'] = float(amount_match[0])
                    elif key == 'description' and value != 'none':
                        expense_data['description'] = value
            
            return expense_data if expense_data else None
            
        except Exception as e:
            logger.error(f"Expense parsing error: {e}")
            return None