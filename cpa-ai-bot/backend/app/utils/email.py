import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import List, Optional, Dict, Any
from datetime import datetime
from pathlib import Path
import logging
from app.config.settings import settings

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        # Email configuration (would be added to settings.py)
        self.smtp_server = getattr(settings, 'SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = getattr(settings, 'SMTP_PORT', 587)
        self.smtp_username = getattr(settings, 'SMTP_USERNAME', '')
        self.smtp_password = getattr(settings, 'SMTP_PASSWORD', '')
        self.from_email = getattr(settings, 'FROM_EMAIL', self.smtp_username)
        self.from_name = getattr(settings, 'FROM_NAME', 'CPA AI Bot')

    async def send_email(
        self,
        to_emails: List[str],
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        attachments: Optional[List[Dict[str, Any]]] = None,
        cc_emails: Optional[List[str]] = None,
        bcc_emails: Optional[List[str]] = None
    ) -> bool:
        """Send email with optional HTML content and attachments"""
        try:
            # Create message container
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = ', '.join(to_emails)
            
            if cc_emails:
                msg['Cc'] = ', '.join(cc_emails)
            
            # Add plain text part
            text_part = MIMEText(body, 'plain', 'utf-8')
            msg.attach(text_part)
            
            # Add HTML part if provided
            if html_body:
                html_part = MIMEText(html_body, 'html', 'utf-8')
                msg.attach(html_part)
            
            # Add attachments if provided
            if attachments:
                for attachment in attachments:
                    self._add_attachment(msg, attachment)
            
            # Combine all recipients
            all_recipients = to_emails[:]
            if cc_emails:
                all_recipients.extend(cc_emails)
            if bcc_emails:
                all_recipients.extend(bcc_emails)
            
            # Send email
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.smtp_username, self.smtp_password)
                server.sendmail(self.from_email, all_recipients, msg.as_string())
            
            logger.info(f"Email sent successfully to {len(all_recipients)} recipients")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False

    def _add_attachment(self, msg: MIMEMultipart, attachment: Dict[str, Any]):
        """Add attachment to email message"""
        try:
            filename = attachment.get('filename', 'attachment')
            content = attachment.get('content', b'')
            content_type = attachment.get('content_type', 'application/octet-stream')
            
            part = MIMEBase(*content_type.split('/'))
            part.set_payload(content)
            encoders.encode_base64(part)
            part.add_header(
                'Content-Disposition',
                f'attachment; filename= {filename}'
            )
            msg.attach(part)
            
        except Exception as e:
            logger.error(f"Error adding attachment {attachment.get('filename', 'unknown')}: {e}")

    async def send_welcome_email(self, user_email: str, user_name: str) -> bool:
        """Send welcome email to new users"""
        subject = f"Welcome to {settings.APP_NAME}!"
        
        body = f"""
Hello {user_name},

Welcome to {settings.APP_NAME}! We're excited to have you on board.

{settings.APP_NAME} is your AI-powered accounting assistant that helps you:
• Track and categorize expenses automatically
• Get instant answers to accounting questions
• Generate financial reports
• Estimate taxes and plan ahead

Getting Started:
1. Log into your account at our web application
2. Start by asking our AI any accounting questions
3. Try logging expenses by simply typing "I spent $50 on office supplies"
4. Explore your dashboard for insights and reports

If you have any questions, our AI assistant is available 24/7 to help!

Best regards,
The {settings.APP_NAME} Team

---
This email was sent to {user_email}. If you didn't sign up for {settings.APP_NAME}, please ignore this email.
        """

        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to {settings.APP_NAME}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50;">Welcome to {settings.APP_NAME}! 🎉</h1>
        
        <p>Hello <strong>{user_name}</strong>,</p>
        
        <p>Welcome to {settings.APP_NAME}! We're excited to have you on board.</p>
        
        <p>{settings.APP_NAME} is your AI-powered accounting assistant that helps you:</p>
        <ul>
            <li>📊 Track and categorize expenses automatically</li>
            <li>💬 Get instant answers to accounting questions</li>
            <li>📈 Generate financial reports</li>
            <li>💰 Estimate taxes and plan ahead</li>
        </ul>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">Getting Started:</h3>
            <ol>
                <li>Log into your account at our web application</li>
                <li>Start by asking our AI any accounting questions</li>
                <li>Try logging expenses by simply typing "I spent $50 on office supplies"</li>
                <li>Explore your dashboard for insights and reports</li>
            </ol>
        </div>
        
        <p>If you have any questions, our AI assistant is available 24/7 to help!</p>
        
        <p>Best regards,<br>
        The {settings.APP_NAME} Team</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #6c757d;">
            This email was sent to {user_email}. If you didn't sign up for {settings.APP_NAME}, please ignore this email.
        </p>
    </div>
</body>
</html>
        """
        
        return await self.send_email([user_email], subject, body, html_body)

    async def send_password_reset_email(self, user_email: str, user_name: str, reset_token: str) -> bool:
        """Send password reset email"""
        reset_url = f"https://your-app-domain.com/reset-password?token={reset_token}"  # Would be configured
        
        subject = f"Reset Your {settings.APP_NAME} Password"
        
        body = f"""
Hello {user_name},

You requested to reset your password for {settings.APP_NAME}.

To reset your password, click the following link:
{reset_url}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

Best regards,
The {settings.APP_NAME} Team
        """

        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50;">Reset Your Password</h1>
        
        <p>Hello <strong>{user_name}</strong>,</p>
        
        <p>You requested to reset your password for {settings.APP_NAME}.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_url}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Reset Password
            </a>
        </div>
        
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
            {reset_url}
        </p>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour for security reasons.
        </div>
        
        <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
        
        <p>Best regards,<br>
        The {settings.APP_NAME} Team</p>
    </div>
</body>
</html>
        """
        
        return await self.send_email([user_email], subject, body, html_body)

    async def send_monthly_report_email(
        self, 
        user_email: str, 
        user_name: str, 
        report_data: Dict[str, Any],
        report_attachment: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Send monthly financial report via email"""
        try:
            month_year = f"{report_data.get('period', {}).get('month_name', 'Unknown')} {report_data.get('period', {}).get('year', '')}"
            total_expenses = report_data.get('summary', {}).get('total_expenses', 0)
            expense_count = report_data.get('summary', {}).get('expense_count', 0)
            
            subject = f"Your {month_year} Financial Report - {settings.APP_NAME}"
            
            body = f"""
Hello {user_name},

Your {month_year} financial report is ready!

📊 Report Summary:
• Total Expenses: ${total_expenses:,.2f}
• Number of Expenses: {expense_count}
• Average Expense: ${total_expenses/expense_count if expense_count > 0 else 0:.2f}

Top Categories:
"""
            
            # Add top categories to body
            categories = report_data.get('summary', {}).get('category_breakdown', [])[:3]
            for i, category in enumerate(categories, 1):
                body += f"{i}. {category.get('category', 'Unknown')}: ${category.get('total_amount', 0):.2f}\n"
            
            body += f"""

View your complete report and insights in your {settings.APP_NAME} dashboard.

Best regards,
The {settings.APP_NAME} Team
            """

            html_body = self._create_report_html(user_name, month_year, report_data)
            
            attachments = [report_attachment] if report_attachment else None
            
            return await self.send_email([user_email], subject, body, html_body, attachments)
            
        except Exception as e:
            logger.error(f"Error sending monthly report email: {e}")
            return False

    def _create_report_html(self, user_name: str, month_year: str, report_data: Dict[str, Any]) -> str:
        """Create HTML content for report email"""
        summary = report_data.get('summary', {})
        total_expenses = summary.get('total_expenses', 0)
        expense_count = summary.get('expense_count', 0)
        categories = summary.get('category_breakdown', [])
        
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Financial Report - {month_year}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50;">Your {month_year} Financial Report 📊</h1>
        
        <p>Hello <strong>{user_name}</strong>,</p>
        
        <p>Your {month_year} financial report is ready!</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">📈 Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;"><strong>Total Expenses:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; text-align: right;"><strong>${total_expenses:,.2f}</strong></td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">Number of Expenses:</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; text-align: right;">{expense_count}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;">Average Expense:</td>
                    <td style="padding: 8px 0; text-align: right;">${total_expenses/expense_count if expense_count > 0 else 0:.2f}</td>
                </tr>
            </table>
        </div>
        
        <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0056b3; margin-top: 0;">💰 Top Categories</h3>
            <table style="width: 100%; border-collapse: collapse;">
        """
        
        # Add category rows
        for category in categories[:5]:
            percentage = category.get('percentage', 0)
            html += f"""
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #bee5eb;">
                        {category.get('category', 'Unknown')}
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #bee5eb; text-align: right;">
                        ${category.get('total_amount', 0):.2f} ({percentage:.1f}%)
                    </td>
                </tr>
            """
        
        html += f"""
            </table>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="https://your-app-domain.com/dashboard" 
               style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                View Complete Report
            </a>
        </div>
        
        <p>View your complete report and insights in your {settings.APP_NAME} dashboard.</p>
        
        <p>Best regards,<br>
        The {settings.APP_NAME} Team</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #6c757d;">
            You're receiving this because you have monthly reports enabled. 
            You can update your email preferences in your account settings.
        </p>
    </div>
</body>
</html>
        """
        
        return html

    async def send_tax_reminder_email(self, user_email: str, user_name: str, quarter: str) -> bool:
        """Send quarterly tax reminder email"""
        subject = f"Tax Payment Reminder - Q{quarter} - {settings.APP_NAME}"
        
        # Tax due dates (simplified)
        due_dates = {
            "Q1": "April 15",
            "Q2": "June 15", 
            "Q3": "September 15",
            "Q4": "January 15"
        }
        
        due_date = due_dates.get(f"Q{quarter}", "Check IRS website")
        
        body = f"""
Hello {user_name},

This is a friendly reminder that Q{quarter} estimated tax payments are due on {due_date}.

💡 Tax Tips:
• Review your Q{quarter} expenses in {settings.APP_NAME}
• Calculate your estimated tax liability
• Make payments online at irs.gov/payments
• Keep records of your payment confirmations

Need help calculating your taxes? Our AI assistant can provide guidance based on your expense data.

Best regards,
The {settings.APP_NAME} Team

Disclaimer: This is a general reminder. Consult a tax professional for specific advice.
        """

        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Tax Payment Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc3545;">📅 Tax Payment Reminder</h1>
        
        <p>Hello <strong>{user_name}</strong>,</p>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <strong>⏰ Important:</strong> Q{quarter} estimated tax payments are due on <strong>{due_date}</strong>.
        </div>
        
        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <h3 style="color: #155724; margin-top: 0;">💡 Tax Tips:</h3>
            <ul style="margin: 0;">
                <li>Review your Q{quarter} expenses in {settings.APP_NAME}</li>
                <li>Calculate your estimated tax liability</li>
                <li>Make payments online at irs.gov/payments</li>
                <li>Keep records of your payment confirmations</li>
            </ul>
        </div>
        
        <p>Need help calculating your taxes? Our AI assistant can provide guidance based on your expense data.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="https://your-app-domain.com/reports" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                View Tax Report
            </a>
        </div>
        
        <p>Best regards,<br>
        The {settings.APP_NAME} Team</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #6c757d;">
            <strong>Disclaimer:</strong> This is a general reminder. Consult a tax professional for specific advice.
        </p>
    </div>
</body>
</html>
        """
        
        return await self.send_email([user_email], subject, body, html_body)

    async def send_system_notification_email(
        self, 
        admin_emails: List[str], 
        subject: str, 
        message: str,
        alert_level: str = "info"
    ) -> bool:
        """Send system notification to administrators"""
        try:
            # Color coding based on alert level
            colors = {
                "info": "#17a2b8",
                "warning": "#ffc107", 
                "error": "#dc3545",
                "success": "#28a745"
            }
            
            color = colors.get(alert_level, "#17a2b8")
            
            html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>System Notification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: {color}; color: white; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            <h1 style="margin: 0;">🚨 System Notification</h1>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px;">
            <p><strong>Alert Level:</strong> {alert_level.upper()}</p>
            <p><strong>Time:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</p>
            <p><strong>Message:</strong></p>
            <p>{message}</p>
        </div>
        
        <p style="margin-top: 20px;">
            This is an automated notification from {settings.APP_NAME}.
        </p>
    </div>
</body>
</html>
            """
            
            return await self.send_email(admin_emails, subject, message, html_body)
            
        except Exception as e:
            logger.error(f"Error sending system notification email: {e}")
            return False

# Create global email service instance
email_service = EmailService()

# Convenience functions
async def send_welcome_email(user_email: str, user_name: str) -> bool:
    """Send welcome email to new user"""
    return await email_service.send_welcome_email(user_email, user_name)

async def send_password_reset_email(user_email: str, user_name: str, reset_token: str) -> bool:
    """Send password reset email"""
    return await email_service.send_password_reset_email(user_email, user_name, reset_token)

async def send_monthly_report_email(user_email: str, user_name: str, report_data: Dict[str, Any]) -> bool:
    """Send monthly report email"""
    return await email_service.send_monthly_report_email(user_email, user_name, report_data)

async def send_tax_reminder_email(user_email: str, user_name: str, quarter: str) -> bool:
    """Send tax reminder email"""
    return await email_service.send_tax_reminder_email(user_email, user_name, quarter)

async def send_admin_notification(admin_emails: List[str], subject: str, message: str, alert_level: str = "info") -> bool:
    """Send notification to administrators"""
    return await email_service.send_system_notification_email(admin_emails, subject, message, alert_level)