from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List
from sqlalchemy.orm import Session
from splitwise import Splitwise
from app.core.config import settings
from app.core.database import get_db
from app.models.db_models import Split, User
from app.api.deps import get_current_user
from app.models.schemas import PublishSplitRequest
from splitwise.expense import Expense
from splitwise.user import ExpenseUser
import logging

router = APIRouter()

logger = logging.getLogger(__name__)

@router.post("/publish-split")
def publish_split(
    request: PublishSplitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Publishes a split to Splitwise.
    """
    logger.info("--- In publish_split ---")
    s_obj = Splitwise(
        consumer_key=settings.splitwise_consumer_key,
        consumer_secret=settings.splitwise_consumer_secret
    )
    s_obj.setAccessToken(current_user.splitwise_access_token)
    logger.info("Splitwise object created and access token set.")

    try:
        expense = Expense()
        expense.setCost(str(request.cost))
        expense.setDescription(request.description)

        users = []
        for user_data in request.users:
            user = ExpenseUser()
            user.setId(user_data.user_id)
            user.setPaidShare(str(user_data.paid_share))
            user.setOwedShare(str(user_data.owed_share))
            users.append(user)
        expense.setUsers(users)

        if request.group_id:
            expense.setGroupId(request.group_id)

        logger.info(f"Creating expense with data: {expense.__dict__}")
        created_expense, errors = s_obj.createExpense(expense)
        if errors:
            logger.error(f"Error creating expense: {errors.getErrors()}")
            raise HTTPException(status_code=400, detail=errors.getErrors())
        logger.info(f"Expense created successfully: {created_expense.getId()}")

        expense_id = created_expense.getId()
        logger.info(f"Creating comment for expense {expense_id} with content: {request.comment}")
        s_obj.createComment(expense_id, request.comment)
        logger.info("Comment created successfully.")

        # Save the split to the database
        db_split = Split(
            user_id=current_user.id,
            split_data=request.model_dump()
        )
        db.add(db_split)
        db.commit()
        db.refresh(db_split)
        logger.info(f"Split saved to database with ID: {db_split.id}")

        return {"message": "Split published successfully!"}

    except Exception as e:
        logger.error(f"--- ERROR in publish_split: {e} ---")
        raise HTTPException(
            status_code=500,
            detail=f"Could not publish split to Splitwise: {e}",
        )
