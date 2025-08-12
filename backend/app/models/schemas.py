from pydantic import BaseModel, Field
from typing import List, Optional

class AssigneeList(BaseModel):
    """List of people assigned to an expense."""
    assigned_to: List["str"]

class ItemSplit(BaseModel):
    """Defines the structure for a single item on the bill."""
    item_name: str = Field(..., description="Name of the purchased item.")
    price: float = Field(..., description="Price of the item.")
    assigned_to: List["str"] = Field(..., description="List of people assigned to this item.")
    quantity: Optional["str"] = Field(None, description="Quantity of the item, if available.")
    status: Optional[str] = Field("shopped", description="Status of the item, e.g., 'shopped', 'weight-adjusted', 'cancelled'.")

class Tax(AssigneeList):
    """Defines the structure for tax."""
    amount: float = Field(..., description="Total tax amount.")

class Tip(AssigneeList):
    """Defines the structure for tip."""
    amount: float = Field(..., description="Total tip amount.")

class BillSplitResponse(BaseModel):
    """The final JSON response structure from our API."""
    items: List["ItemSplit"]
    tax: Optional["Tax"] = Field(None, description="Details for tax, if found.")
    tip: Optional["Tip"] = Field(None, description="Details for tip, if found.")

# ForwardRef is needed for self-referential types in the List
ItemSplit.update_forward_refs()
AssigneeList.update_forward_refs()
BillSplitResponse.update_forward_refs()