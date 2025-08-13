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

    def _convert_object_id(self, doc: dict) -> dict:
        """Convert ObjectId to string for JSON serialization"""
        if doc and "_id" in doc:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
        # Convert other ObjectId fields
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                doc[key] = str(value)
        return doc

    async def create(self, data: dict) -> dict:
        """Create a new document"""
        data["created_at"] = datetime.utcnow()
        data["updated_at"] = datetime.utcnow()
        result = await self.collection.insert_one(data)
        data["_id"] = result.inserted_id
        return self._convert_object_id(data)

    async def get_by_id(self, id: str) -> Optional[dict]:
        """Get document by ID"""
        if not ObjectId.is_valid(id):
            return None
        doc = await self.collection.find_one({"_id": ObjectId(id)})
        return self._convert_object_id(doc) if doc else None

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

    async def find(self, query: dict = None, limit: int = None, skip: int = 0, sort: List[tuple] = None) -> List[dict]:
        """Find documents with optional sorting"""
        if query is None:
            query = {}
        
        cursor = self.collection.find(query)
        
        # Apply sorting if provided
        if sort:
            cursor = cursor.sort(sort)
        
        # Apply skip and limit
        cursor = cursor.skip(skip)
        if limit:
            cursor = cursor.limit(limit)
        
        documents = await cursor.to_list(length=None)
        return [self._convert_object_id(doc) for doc in documents]

    async def count(self, query: dict = None) -> int:
        """Count documents matching query"""
        if query is None:
            query = {}
        return await self.collection.count_documents(query)

    async def find_one(self, query: dict) -> Optional[dict]:
        """Find single document"""
        doc = await self.collection.find_one(query)
        return self._convert_object_id(doc) if doc else None

    async def bulk_delete(self, query: dict) -> int:
        """Delete multiple documents matching query"""
        result = await self.collection.delete_many(query)
        return result.deleted_count

    async def bulk_update(self, query: dict, update_data: dict) -> int:
        """Update multiple documents matching query"""
        update_data["updated_at"] = datetime.utcnow()
        result = await self.collection.update_many(query, {"$set": update_data})
        return result.modified_count

    async def exists(self, query: dict) -> bool:
        """Check if document exists"""
        doc = await self.collection.find_one(query, {"_id": 1})
        return doc is not None

    async def aggregate(self, pipeline: List[dict]) -> List[dict]:
        """Run aggregation pipeline"""
        cursor = self.collection.aggregate(pipeline)
        documents = await cursor.to_list(length=None)
        return [self._convert_object_id(doc) for doc in documents]