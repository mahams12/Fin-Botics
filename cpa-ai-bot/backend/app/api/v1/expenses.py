from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import date
from app.services.expense_service import ExpenseService
from app.schemas.expense_schema import (
    ExpenseCreateRequest, ExpenseFromTextRequest, ExpenseUpdateRequest,
    ExpenseResponse, ExpenseListResponse
)
from app.api.deps import get_current_active_user
from app.models.user import User
import logging

logger = logging.getLogger(__name__)
router = APIRouter()
expense_service = ExpenseService()

@router.post("/", response_model=ExpenseResponse)
async def create_expense(
    request: ExpenseCreateRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Create a new expense"""
    try:
        from app.models.expense import ExpenseCreate
        expense_data = ExpenseCreate(**request.dict())
        expense = await expense_service.create_expense(str(current_user.id), expense_data)
        
        return ExpenseResponse(
            id=str(expense.id),
            description=expense.description,
            amount=expense.amount,
            category=expense.category,
            date=expense.date,
            notes=expense.notes,
            created_at=expense.created_at
        )
        
    except Exception as e:
        logger.error(f"Error creating expense: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create expense"
        )

@router.post("/from-text")
async def create_expense_from_text(
    request: ExpenseFromTextRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Create expense from natural language text"""
    try:
        result = await expense_service.create_expense_from_text(
            str(current_user.id), 
            request.text
        )
        
        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
        
        expense = result["expense"]
        return {
            "success": True,
            "expense": ExpenseResponse(
                id=str(expense.id),
                description=expense.description,
                amount=expense.amount,
                category=expense.category,
                date=expense.date,
                notes=expense.notes,
                created_at=expense.created_at
            ),
            "categorization": result["categorization"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating expense from text: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process expense text"
        )

@router.get("/", response_model=ExpenseListResponse)
async def get_expenses(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    category: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_active_user)
):
    """Get user's expenses with filters"""
    try:
        skip = (page - 1) * per_page
        
        expenses = await expense_service.get_user_expenses(
            user_id=str(current_user.id),
            limit=per_page,
            skip=skip,
            category=category,
            start_date=start_date,
            end_date=end_date
        )
        
        expense_responses = [
            ExpenseResponse(
                id=str(expense.id),
                description=expense.description,
                amount=expense.amount,
                category=expense.category,
                date=expense.date,
                notes=expense.notes,
                created_at=expense.created_at
            )
            for expense in expenses
        ]
        
        return ExpenseListResponse(
            expenses=expense_responses,
            total=len(expense_responses),
            page=page,
            per_page=per_page
        )
        
    except Exception as e:
        logger.error(f"Error getting expenses: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve expenses"
        )

@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(
    expense_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get expense by ID"""
    expense = await expense_service.get_expense_by_id(expense_id, str(current_user.id))
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    return ExpenseResponse(
        id=str(expense.id),
        description=expense.description,
        amount=expense.amount,
        category=expense.category,
        date=expense.date,
        notes=expense.notes,
        created_at=expense.created_at
    )

@router.put("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: str,
    request: ExpenseUpdateRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Update expense"""
    update_data = {k: v for k, v in request.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data provided for update"
        )
    
    expense = await expense_service.update_expense(
        expense_id, 
        str(current_user.id), 
        update_data
    )
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    return ExpenseResponse(
        id=str(expense.id),
        description=expense.description,
        amount=expense.amount,
        category=expense.category,
        date=expense.date,
        notes=expense.notes,
        created_at=expense.created_at
    )

@router.delete("/{expense_id}")
async def delete_expense(
    expense_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Delete expense"""
    success = await expense_service.delete_expense(expense_id, str(current_user.id))
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    return {"message": "Expense deleted successfully"}