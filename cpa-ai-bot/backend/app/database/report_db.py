from typing import Optional, List, Dict, Any
from datetime import datetime, date
from app.database.base import BaseDatabase
from app.models.report import (
    Report, ReportInDB, ScheduledReport, ScheduledReportInDB,
    ReportTemplate, ReportSummary
)
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

class ReportDatabase(BaseDatabase):
    def __init__(self):
        super().__init__("reports")
        self.scheduled_reports_collection = None
        self.report_templates_collection = None

    @property
    def scheduled_reports(self):
        """Get scheduled reports collection"""
        if self.scheduled_reports_collection is None:
            from app.config.database import get_database
            db = get_database()
            self.scheduled_reports_collection = db["scheduled_reports"]
        return self.scheduled_reports_collection

    @property
    def report_templates(self):
        """Get report templates collection"""
        if self.report_templates_collection is None:
            from app.config.database import get_database
            db = get_database()
            self.report_templates_collection = db["report_templates"]
        return self.report_templates_collection

    async def create_report(self, user_id: str, report_data: dict) -> Report:
        """Create a new report"""
        try:
            report_data["user_id"] = ObjectId(user_id)
            report_dict = await self.create(report_data)
            return Report(**report_dict)
        except Exception as e:
            logger.error(f"Error creating report: {e}")
            raise

    async def get_report_by_id(self, report_id: str) -> Optional[Report]:
        """Get report by ID"""
        try:
            report_dict = await self.get_by_id(report_id)
            if report_dict:
                return Report(**report_dict)
            return None
        except Exception as e:
            logger.error(f"Error getting report by ID {report_id}: {e}")
            return None

    async def get_user_reports(
        self, 
        user_id: str, 
        report_type: Optional[str] = None,
        limit: int = 50, 
        skip: int = 0
    ) -> List[Report]:
        """Get reports for a specific user"""
        try:
            query = {"user_id": ObjectId(user_id)}
            
            if report_type:
                query["report_type"] = report_type
            
            reports = await self.find(query, limit=limit, skip=skip)
            return [Report(**report) for report in reports]
        except Exception as e:
            logger.error(f"Error getting user reports: {e}")
            return []

    async def update_report(self, report_id: str, update_data: dict) -> Optional[Report]:
        """Update report"""
        try:
            report_dict = await self.update(report_id, update_data)
            if report_dict:
                return Report(**report_dict)
            return None
        except Exception as e:
            logger.error(f"Error updating report {report_id}: {e}")
            return None

    async def delete_report(self, report_id: str) -> bool:
        """Delete report"""
        try:
            return await self.delete(report_id)
        except Exception as e:
            logger.error(f"Error deleting report {report_id}: {e}")
            return False

    async def get_recent_reports(self, user_id: str, limit: int = 10) -> List[Report]:
        """Get recent reports for user"""
        try:
            query = {"user_id": ObjectId(user_id)}
            # Sort by created_at descending to get most recent first
            cursor = self.collection.find(query).sort("created_at", -1).limit(limit)
            reports = await cursor.to_list(length=None)
            return [Report(**report) for report in reports]
        except Exception as e:
            logger.error(f"Error getting recent reports: {e}")
            return []

    async def get_reports_by_date_range(
        self, 
        user_id: str,
        start_date: datetime,
        end_date: datetime
    ) -> List[Report]:
        """Get reports within a date range"""
        try:
            query = {
                "user_id": ObjectId(user_id),
                "created_at": {
                    "$gte": start_date,
                    "$lte": end_date
                }
            }
            reports = await self.find(query)
            return [Report(**report) for report in reports]
        except Exception as e:
            logger.error(f"Error getting reports by date range: {e}")
            return []

    async def get_report_statistics(self, user_id: str) -> Dict[str, Any]:
        """Get report statistics for user"""
        try:
            user_oid = ObjectId(user_id)
            
            # Get total count
            total_reports = await self.collection.count_documents({"user_id": user_oid})
            
            # Get count by report type
            pipeline = [
                {"$match": {"user_id": user_oid}},
                {"$group": {"_id": "$report_type", "count": {"$sum": 1}}}
            ]
            
            type_counts = {}
            async for doc in self.collection.aggregate(pipeline):
                type_counts[doc["_id"]] = doc["count"]
            
            # Get recent activity (last 30 days)
            thirty_days_ago = datetime.utcnow().replace(day=1) - datetime.timedelta(days=30)
            recent_count = await self.collection.count_documents({
                "user_id": user_oid,
                "created_at": {"$gte": thirty_days_ago}
            })
            
            return {
                "total_reports": total_reports,
                "reports_by_type": type_counts,
                "recent_reports": recent_count,
                "most_common_type": max(type_counts.keys(), key=type_counts.get) if type_counts else None
            }
            
        except Exception as e:
            logger.error(f"Error getting report statistics: {e}")
            return {}

    # Scheduled Reports Operations
    async def create_scheduled_report(self, user_id: str, schedule_data: dict) -> ScheduledReportInDB:
        """Create a scheduled report"""
        try:
            schedule_data["user_id"] = ObjectId(user_id)
            schedule_data["created_at"] = datetime.utcnow()
            schedule_data["updated_at"] = datetime.utcnow()
            
            result = await self.scheduled_reports.insert_one(schedule_data)
            schedule_data["_id"] = result.inserted_id
            
            return ScheduledReportInDB(**schedule_data)
        except Exception as e:
            logger.error(f"Error creating scheduled report: {e}")
            raise

    async def get_scheduled_report_by_id(self, schedule_id: str) -> Optional[ScheduledReportInDB]:
        """Get scheduled report by ID"""
        try:
            if not ObjectId.is_valid(schedule_id):
                return None
                
            schedule_dict = await self.scheduled_reports.find_one({"_id": ObjectId(schedule_id)})
            if schedule_dict:
                return ScheduledReportInDB(**schedule_dict)
            return None
        except Exception as e:
            logger.error(f"Error getting scheduled report {schedule_id}: {e}")
            return None

    async def get_user_scheduled_reports(self, user_id: str) -> List[ScheduledReportInDB]:
        """Get all scheduled reports for a user"""
        try:
            query = {"user_id": ObjectId(user_id)}
            cursor = self.scheduled_reports.find(query).sort("created_at", -1)
            schedules = await cursor.to_list(length=None)
            return [ScheduledReportInDB(**schedule) for schedule in schedules]
        except Exception as e:
            logger.error(f"Error getting user scheduled reports: {e}")
            return []

    async def update_scheduled_report(self, schedule_id: str, update_data: dict) -> Optional[ScheduledReportInDB]:
        """Update scheduled report"""
        try:
            if not ObjectId.is_valid(schedule_id):
                return None
                
            update_data["updated_at"] = datetime.utcnow()
            
            await self.scheduled_reports.update_one(
                {"_id": ObjectId(schedule_id)},
                {"$set": update_data}
            )
            
            return await self.get_scheduled_report_by_id(schedule_id)
        except Exception as e:
            logger.error(f"Error updating scheduled report {schedule_id}: {e}")
            return None

    async def delete_scheduled_report(self, schedule_id: str) -> bool:
        """Delete scheduled report"""
        try:
            if not ObjectId.is_valid(schedule_id):
                return False
                
            result = await self.scheduled_reports.delete_one({"_id": ObjectId(schedule_id)})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting scheduled report {schedule_id}: {e}")
            return False

    async def get_due_scheduled_reports(self) -> List[ScheduledReportInDB]:
        """Get scheduled reports that are due to run"""
        try:
            now = datetime.utcnow()
            query = {
                "is_active": True,
                "next_run_date": {"$lte": now}
            }
            
            cursor = self.scheduled_reports.find(query)
            schedules = await cursor.to_list(length=None)
            return [ScheduledReportInDB(**schedule) for schedule in schedules]
        except Exception as e:
            logger.error(f"Error getting due scheduled reports: {e}")
            return []

    async def update_scheduled_report_run(self, schedule_id: str) -> bool:
        """Update scheduled report after run"""
        try:
            if not ObjectId.is_valid(schedule_id):
                return False
                
            schedule = await self.get_scheduled_report_by_id(schedule_id)
            if not schedule:
                return False
            
            # Calculate next run date based on frequency
            next_run_date = self._calculate_next_run_date(schedule.frequency)
            
            update_data = {
                "last_run_date": datetime.utcnow(),
                "next_run_date": next_run_date,
                "run_count": schedule.run_count + 1,
                "updated_at": datetime.utcnow()
            }
            
            await self.scheduled_reports.update_one(
                {"_id": ObjectId(schedule_id)},
                {"$set": update_data}
            )
            
            return True
        except Exception as e:
            logger.error(f"Error updating scheduled report run {schedule_id}: {e}")
            return False

    def _calculate_next_run_date(self, frequency: str) -> datetime:
        """Calculate next run date based on frequency"""
        now = datetime.utcnow()
        
        if frequency == "daily":
            return now + datetime.timedelta(days=1)
        elif frequency == "weekly":
            return now + datetime.timedelta(weeks=1)
        elif frequency == "monthly":
            # Add one month (approximately)
            if now.month == 12:
                return now.replace(year=now.year + 1, month=1)
            else:
                return now.replace(month=now.month + 1)
        elif frequency == "quarterly":
            # Add 3 months
            month = now.month + 3
            year = now.year
            if month > 12:
                month -= 12
                year += 1
            return now.replace(year=year, month=month)
        elif frequency == "annually":
            return now.replace(year=now.year + 1)
        else:
            # Default to monthly
            return now + datetime.timedelta(days=30)

    # Report Templates Operations
    async def create_report_template(self, user_id: str, template_data: dict) -> dict:
        """Create a report template"""
        try:
            template_data["user_id"] = ObjectId(user_id)
            template_data["created_at"] = datetime.utcnow()
            template_data["updated_at"] = datetime.utcnow()
            template_data["usage_count"] = 0
            
            result = await self.report_templates.insert_one(template_data)
            template_data["_id"] = result.inserted_id
            
            return template_data
        except Exception as e:
            logger.error(f"Error creating report template: {e}")
            raise

    async def get_report_template_by_id(self, template_id: str) -> Optional[dict]:
        """Get report template by ID"""
        try:
            if not ObjectId.is_valid(template_id):
                return None
                
            return await self.report_templates.find_one({"_id": ObjectId(template_id)})
        except Exception as e:
            logger.error(f"Error getting report template {template_id}: {e}")
            return None

    async def get_user_report_templates(self, user_id: str) -> List[dict]:
        """Get report templates for a user"""
        try:
            query = {"user_id": ObjectId(user_id)}
            cursor = self.report_templates.find(query).sort("created_at", -1)
            return await cursor.to_list(length=None)
        except Exception as e:
            logger.error(f"Error getting user report templates: {e}")
            return []

    async def get_public_report_templates(self) -> List[dict]:
        """Get public report templates"""
        try:
            query = {"is_public": True}
            cursor = self.report_templates.find(query).sort("usage_count", -1)
            return await cursor.to_list(length=None)
        except Exception as e:
            logger.error(f"Error getting public report templates: {e}")
            return []

    async def increment_template_usage(self, template_id: str) -> bool:
        """Increment template usage count"""
        try:
            if not ObjectId.is_valid(template_id):
                return False
                
            result = await self.report_templates.update_one(
                {"_id": ObjectId(template_id)},
                {"$inc": {"usage_count": 1}}
            )
            
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error incrementing template usage {template_id}: {e}")
            return False

    async def delete_report_template(self, template_id: str) -> bool:
        """Delete report template"""
        try:
            if not ObjectId.is_valid(template_id):
                return False
                
            result = await self.report_templates.delete_one({"_id": ObjectId(template_id)})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting report template {template_id}: {e}")
            return False

    # Search and Analytics
    async def search_reports(
        self, 
        user_id: str, 
        search_term: str, 
        limit: int = 20
    ) -> List[Report]:
        """Search reports by title or notes"""
        try:
            query = {
                "user_id": ObjectId(user_id),
                "$or": [
                    {"title": {"$regex": search_term, "$options": "i"}},
                    {"notes": {"$regex": search_term, "$options": "i"}}
                ]
            }
            
            reports = await self.find(query, limit=limit)
            return [Report(**report) for report in reports]
        except Exception as e:
            logger.error(f"Error searching reports: {e}")
            return []

    async def get_report_analytics(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive report analytics"""
        try:
            user_oid = ObjectId(user_id)
            
            # Aggregation pipeline for detailed analytics
            pipeline = [
                {"$match": {"user_id": user_oid}},
                {
                    "$group": {
                        "_id": {
                            "type": "$report_type",
                            "year": {"$year": "$created_at"},
                            "month": {"$month": "$created_at"}
                        },
                        "count": {"$sum": 1}
                    }
                },
                {
                    "$group": {
                        "_id": "$_id.type",
                        "total": {"$sum": "$count"},
                        "monthly_data": {
                            "$push": {
                                "year": "$_id.year",
                                "month": "$_id.month",
                                "count": "$count"
                            }
                        }
                    }
                }
            ]
            
            analytics_data = {}
            async for doc in self.collection.aggregate(pipeline):
                analytics_data[doc["_id"]] = {
                    "total": doc["total"],
                    "monthly_breakdown": doc["monthly_data"]
                }
            
            return {
                "report_types": analytics_data,
                "total_reports": sum(data["total"] for data in analytics_data.values()),
                "generated_at": datetime.utcnow()
            }
            
        except Exception as e:
            logger.error(f"Error getting report analytics: {e}")
            return {}

    async def cleanup_old_reports(self, days_to_keep: int = 365) -> int:
        """Clean up old reports (admin function)"""
        try:
            cutoff_date = datetime.utcnow() - datetime.timedelta(days=days_to_keep)
            
            result = await self.collection.delete_many({
                "created_at": {"$lt": cutoff_date}
            })
            
            logger.info(f"Cleaned up {result.deleted_count} old reports")
            return result.deleted_count
        except Exception as e:
            logger.error(f"Error cleaning up old reports: {e}")
            return 0