from fastapi import APIRouter, Depends, HTTPException
import redis
import json
from typing import List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.cache import get_redis
from app.models.db_models import User, Split as SplitModel
from app.models.schemas import Split as SplitSchema
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/splits", response_model=List[SplitSchema])
def get_user_splits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    cache: redis.Redis = Depends(get_redis)
):
    """
    Get all splits for the current user.
    """
    cache_key = f"user:{current_user.id}:splits"
    cached_splits = cache.get(cache_key)

    if cached_splits:
        print("CACHE HIT for key:", cache_key)
        return json.loads(cached_splits)

    print("CACHE MISS for key:", cache_key)

    splits = db.query(SplitModel).filter(SplitModel.user_id == current_user.id).all()
    # Pydantic models need to be converted to dicts for JSON serialization
    splits_data = [SplitSchema.from_orm(s).model_dump() for s in splits]
    cache.set(cache_key, json.dumps(splits_data), ex=3600)
    return splits_data

@router.delete("/splits/{split_id}")
def delete_split(
    split_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    cache: redis.Redis = Depends(get_redis)
):
    """
    Delete a split for the current user.
    """
    split = db.query(SplitModel).filter(SplitModel.id == split_id).first()

    if not split:
        raise HTTPException(status_code=404, detail="Split not found")

    if split.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this split")
    
    cache.delete(f"user:{current_user.id}:splits")
    cache.delete(f"split:{split_id}")

    db.delete(split)
    db.commit()

    return {"message": "Split deleted successfully"}

@router.get("/splits/{split_id}", response_model=SplitSchema)
def get_split(
    split_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    cache: redis.Redis = Depends(get_redis)
):
    """
    Get a specific split for the current user.
    """
    cache_key = f"split:{split_id}"
    cached_split = cache.get(cache_key)

    if cached_split:
        return json.loads(cached_split)

    split = db.query(SplitModel).filter(SplitModel.id == split_id).first()

    if not split:
        raise HTTPException(status_code=404, detail="Split not found")

    if split.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this split")
    
    split_data = SplitSchema.from_orm(split).model_dump()
    cache.set(cache_key, json.dumps(split_data), ex=3600)

    return split
