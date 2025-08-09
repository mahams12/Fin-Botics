from typing import Optional, List, Dict, Any
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorCollection
from app.config.database import get_database
from datetime import datetime

class BaseDatabase:
    def __init__(self, collection_name: str):
        self.collection_name = collection_name
        self._collection: Optional[AsyncIOMotorCollection] = None

    @property
    def collection(self) -> AsyncIOMotorCollection:
        if self._collection is None:
            db = get_database()
            self._collection = db[self.collection_name]
        return self._collection

    async def create(self, data: dict) -> dict:
        """Create a new document"""
        data["created_at"] = datetime.utcnow()
        data["updated_at"] = datetime.utcnow()
        result = await self.collection.insert_one(data)
        data["_id"] = result.inserted_id
        return data

    async def get_by_id(self, id: str) -> Optional[dict]:
        """Get document by ID"""
        if not ObjectId.is_valid(id):
            return None
        return await self.collection.find_one({"_id": ObjectId(id)})

    async def update(self, id: str, data: dict) -> Optional[dict]:
        """Update document by ID"""
        if not ObjectId.is_valid(id):
            return None
        
        data["updated_at"] = datetime.utcnow()
        await self.collection.update_one(
            {"_id": ObjectId(id)}, 
            {"$set": data}
        )
        return await self.get_by_id(id)

    async def delete(self, id: str) -> bool:
        """Delete document by ID"""
        if not ObjectId.is_valid(id):
            return False
        
        result = await self.collection.delete_one({"_id": ObjectId(id)})
        return result.deleted_count > 0

    async def find(self, query: dict = None, limit: int = None, skip: int = 0) -> List[dict]:
        """Find documents"""
        if query is None:
            query = {}
        
        cursor = self.collection.find(query).skip(skip)
        if limit:
            cursor = cursor.limit(limit)
        
        return await cursor.to_list(length=None)