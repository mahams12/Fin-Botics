import openai
from typing import Optional, Dict, Any
from app.config.settings import settings
import re
import logging
import asyncio

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        logger.info("AI Service initialized")

    async def process_chat_message(self, message: str, context: str = "") -> str:
        """Process chat message with AI"""
        try:
            logger.info(f"Processing chat message with AI: {message[:50]}...")
            
            system_prompt = """You are a helpful CPA AI assistant specialized in accounting and tax matters. You help with:

🏢 Business & Tax Questions:
- Tax deductions and strategies
- Business expense categorization
- Quarterly tax estimation
- Financial planning for small businesses
- Cash flow management
- Bookkeeping best practices

📊 Financial Guidance:
- Profit & loss analysis
- Tax-efficient business structures
- Record-keeping requirements
- Expense tracking strategies

💡 Key Guidelines:
- Keep responses clear, actionable, and professional
- Provide specific examples when helpful
- Always mention this is general guidance
- Recommend consulting a licensed CPA for complex situations
- Be friendly but authoritative

If asked about non-accounting topics, politely redirect to accounting/tax matters."""

            messages = [
                {"role": "system", "content": system_prompt},
            ]
            
            if context:
                messages.append({"role": "system", "content": f"Previous conversation context:\n{context}"})
            
            messages.append({"role": "user", "content": message})

            # Use asyncio to handle the OpenAI API call
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=messages,
                    max_tokens=600,  # Increased for more detailed responses
                    temperature=0.7,
                    timeout=30  # 30 second timeout
                )
            )
            
            ai_response = response.choices[0].message.content
            logger.info(f"AI response generated successfully (length: {len(ai_response)})")
            
            return ai_response
            
        except openai.RateLimitError as e:
            logger.error(f"OpenAI rate limit exceeded: {e}")
            return "I'm currently experiencing high demand. Please wait a moment and try again."
            
        except openai.APITimeoutError as e:
            logger.error(f"OpenAI API timeout: {e}")
            return "My response is taking longer than usual. Please try again."
            
        except openai.AuthenticationError as e:
            logger.error(f"OpenAI authentication error: {e}")
            return "I'm having trouble connecting to my AI service. Please contact support."
            
        except Exception as e:
            logger.error(f"AI service error: {e}")
            return "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment."

    async def categorize_expense(self, description: str, amount: float) -> Dict[str, Any]:
        """Categorize expense using AI"""
        try:
            logger.info(f"Categorizing expense: {description}")
            
            prompt = f"""
            Categorize this business expense for tax purposes:
            
            Description: {description}
            Amount: ${amount:.2f}
            
            Choose the MOST APPROPRIATE category from these options:
            - office_supplies (paper, pens, desk items, basic office equipment)
            - marketing (advertising, promotions, website costs, business cards)
            - travel (business trips, mileage, hotels, flights)
            - meals (business meals, client entertainment - note: usually 50% deductible)
            - utilities (electricity, internet, phone for business)
            - software (subscriptions, licenses, apps, SaaS tools)
            - professional_services (legal, accounting, consulting fees)
            - equipment (computers, machinery, furniture over $500)
            - rent (office space, storage)
            - insurance (business liability, professional insurance)
            - training (courses, conferences, professional development)
            - other (anything that doesn't fit above categories)
            
            Respond in this exact format:
            Category: [category_name]
            Explanation: [brief explanation of why this category fits and any tax implications]
            Confidence: [High/Medium/Low]
            """

            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=150,
                    temperature=0.3,
                    timeout=20
                )
            )
            
            result = response.choices[0].message.content.strip()
            logger.info(f"Expense categorization result: {result}")
            
            # Parse response
            category = "other"
            explanation = "Could not categorize automatically"
            confidence = 0.3
            
            lines = result.split('\n')
            for line in lines:
                if line.startswith('Category:'):
                    category = line.replace('Category:', '').strip()
                elif line.startswith('Explanation:'):
                    explanation = line.replace('Explanation:', '').strip()
                elif line.startswith('Confidence:'):
                    conf_text = line.replace('Confidence:', '').strip().lower()
                    if conf_text == 'high':
                        confidence = 0.9
                    elif conf_text == 'medium':
                        confidence = 0.7
                    else:
                        confidence = 0.5
            
            return {
                "category": category,
                "explanation": explanation,
                "confidence": confidence
            }
                
        except Exception as e:
            logger.error(f"Expense categorization error: {e}")
            return {
                "category": "other",
                "explanation": "Error in automatic categorization - please review manually",
                "confidence": 0.0
            }

    async def parse_expense_from_text(self, text: str) -> Optional[Dict[str, Any]]:
        """Extract expense information from natural language text"""
        try:
            logger.info(f"Parsing expense from text: {text}")
            
            prompt = f"""
            Extract expense information from this text: "{text}"
            
            Look for:
            1. Amount (any dollar figure, number with $, or spelled out amounts)
            2. Description (what was purchased/paid for)
            3. Date (if mentioned, otherwise assume today)
            4. Vendor/Store (where it was purchased, if mentioned)
            
            Return in this exact format:
            Amount: [number only, no $ sign]
            Description: [brief, clear description]
            Vendor: [store/company name if mentioned, otherwise "Unknown"]
            
            If no clear amount found, return "Amount: none"
            If no clear description found, return "Description: none"
            
            Examples:
            "I spent $50 on office supplies at Staples" → 
            Amount: 50
            Description: office supplies
            Vendor: Staples
            
            "Paid 25 dollars for lunch meeting" →
            Amount: 25
            Description: lunch meeting
            Vendor: Unknown
            """

            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=150,
                    temperature=0.3,
                    timeout=15
                )
            )
            
            result = response.choices[0].message.content.strip()
            logger.info(f"Expense parsing result: {result}")
            
            # Parse the response
            lines = result.split('\n')
            expense_data = {}
            
            for line in lines:
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip().lower()
                    value = value.strip()
                    
                    if key == 'amount' and value.lower() != 'none':
                        # Extract number from amount
                        amount_match = re.findall(r'\d+\.?\d*', value)
                        if amount_match:
                            expense_data['amount'] = float(amount_match[0])
                    elif key == 'description' and value.lower() != 'none':
                        expense_data['description'] = value
                    elif key == 'vendor' and value.lower() not in ['none', 'unknown']:
                        expense_data['vendor'] = value
            
            return expense_data if expense_data else None
            
        except Exception as e:
            logger.error(f"Expense parsing error: {e}")
            return None