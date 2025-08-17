from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from typing import List
from sqlalchemy.orm import Session

from app.services.bill_parser import MultimodalBillParser, get_multimodal_parser
from app.models.schemas import BillSplitResponse
from app.core.database import get_db
from app.models.db_models import Split, User
from app.api.deps import get_current_user

router = APIRouter()

@router.post(
    "/split-bill/",
    response_model=BillSplitResponse,
    summary="Upload a receipt (image or PDF) to split a bill"
)
async def split_bill_endpoint(
    participants: List[str] = Form(..., description="List of participant names."),
    user_prompt: str = Form("", description="Natural language prompt for splitting instructions."),
    file: UploadFile = File(..., description="Image or PDF of the receipt."),
    # Update the dependency to use the new multimodal parser
    parser: MultimodalBillParser = Depends(get_multimodal_parser),
    db: Session = Depends(get_db)
):
    """
    This endpoint processes a receipt image or PDF to itemize and split expenses.
    - It sends the file and user instructions directly to a multimodal GenAI model.
    - It returns a structured JSON object of the split bill.
    """
    # Update the content type check to include PDFs
    if not (file.content_type.startswith("image/") or file.content_type == "application/pdf"):
        raise HTTPException(status_code=400, detail="File must be an image or a PDF.")

    file_bytes = await file.read()

    try:
        split_data = parser.parse_bill_from_media(
            file_bytes=file_bytes,
            content_type=file.content_type,
            participants=participants,
            user_prompt=user_prompt
        )

        # TODO: Get the current user from the session/token
        # current_user_id = 1 # Replace with actual user ID

        # db_split = Split(
        #     user_id=current_user_id,
        #     split_data=split_data.model_dump()
        # )
        # db.add(db_split)
        # db.commit()
        # db.refresh(db_split)

        return split_data
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

@router.get("/me")
def get_current_user_data(current_user: User = Depends(get_current_user)):
    """
    Returns the current user's data from the database.
    """
    return current_user