from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List
import redis
from sqlalchemy.orm import Session
from splitwise import Splitwise
from app.core.config import settings
from app.core.database import get_db
from app.core.cache import get_redis
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
    current_user: User = Depends(get_current_user),
    cache: redis.Redis = Depends(get_redis)
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

        # --- Start of new logic ---
        if request.expense_id:
            # UPDATE existing expense
            expense.setId(request.expense_id)
            updated_expense, errors = s_obj.updateExpense(expense)
            if errors:
                raise HTTPException(status_code=400, detail=errors.getErrors())

            expense_id = updated_expense.getId()
            logger.info(f"Expense {expense_id} updated successfully.")

            # Update the existing record in our database
            db_split = db.query(Split).filter(Split.splitwise_expense_id == expense_id).first()
            if db_split:
                db_split.split_data = request.model_dump()
                db.commit()
                logger.info(f"Database record for split {db_split.id} updated.")

                cache.delete(f"user:{current_user.id}:splits")
                cache.delete(f"split:{db_split.id}")
                logger.info(f"Cache invalidated for user:{current_user.id}:splits and split:{db_split.id}")

        else:
            # CREATE new expense
            created_expense, errors = s_obj.createExpense(expense)
            if errors:
                raise HTTPException(status_code=400, detail=errors.getErrors())
            
            expense_id = created_expense.getId()
            logger.info(f"Expense created successfully: {expense_id}")

            # Save the new split to the database with the new expense_id
            db_split = Split(
                user_id=current_user.id,
                split_data=request.model_dump(),
                splitwise_expense_id=expense_id
            )
            db.add(db_split)
            db.commit()
            db.refresh(db_split)
            logger.info(f"Split saved to database with ID: {db_split.id}")

            cache.delete(f"user:{current_user.id}:splits")
            print(f"Cache invalidated for user:{current_user.id}:splits")
        
        # This part runs for both create and update
        s_obj.createComment(expense_id, request.comment)
        logger.info("Comment created/updated successfully.")
        
        return {"message": "Split published successfully!"}
        # --- End of new logic ---

    except Exception as e:
        logger.error(f"--- ERROR in publish_split: {e} ---")
        raise HTTPException(
            status_code=500,
            detail=f"Could not publish split to Splitwise: {e}",
        )
