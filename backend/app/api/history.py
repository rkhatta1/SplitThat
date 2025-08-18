from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.db_models import User, Split as SplitModel
from app.models.schemas import Split as SplitSchema
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/splits", response_model=List[SplitSchema])
def get_user_splits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all splits for the current user.
    """
    return current_user.splits

@router.delete("/splits/{split_id}")
def delete_split(
    split_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a split for the current user.
    """
    split = db.query(SplitModel).filter(SplitModel.id == split_id).first()

    if not split:
        raise HTTPException(status_code=404, detail="Split not found")

    if split.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this split")

    db.delete(split)
    db.commit()

    return {"message": "Split deleted successfully"}

@router.get("/splits/{split_id}", response_model=SplitSchema)
def get_split(
    split_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific split for the current user.
    """
    split = db.query(SplitModel).filter(SplitModel.id == split_id).first()

    if not split:
        raise HTTPException(status_code=404, detail="Split not found")

    if split.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this split")

    return split
