from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from typing import List

from app.services.bill_parser import MultimodalBillParser, get_multimodal_parser
from app.models.schemas import BillSplitResponse

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
    parser: MultimodalBillParser = Depends(get_multimodal_parser)
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
        return split_data
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")