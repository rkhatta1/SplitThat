from pydantic import BaseModel, Field
from typing import List, Optional

class AssigneeList(BaseModel):
    """List of people assigned to an expense."""
    assigned_to: List["str"]

class ItemSplit(BaseModel):
    id: str = Field(..., description="Unique identifier for the item.")
    item_name: str = Field(..., description="Name of the purchased item.")
    price: float = Field(..., description="Price of the item.")
    assigned_to: List["str"] = Field(..., description="List of people assigned to this item.")
    quantity: Optional["str"] = Field(None, description="Quantity of the item, if available.")
    status: Optional[str] = Field("shopped", description="Status of the item, e.g., 'shopped', 'weight-adjusted', 'cancelled'.")
    confidence: str = Field("medium", description="Confidence level of the item extraction (low, medium, high).")

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

class PublishSplitUser(BaseModel):
    user_id: int
    first_name: str
    last_name: Optional[str] = None
    paid_share: float
    owed_share: float

class PublishSplitRequest(BaseModel):
    cost: float
    description: str
    users: List[PublishSplitUser]
    items: List[ItemSplit]
    subtotal: float
    tax: Optional[Tax] = None
    tip: Optional[Tip] = None
    comment: str
    group_id: Optional[int] = None
    expense_id: Optional[int] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class Split(BaseModel):
    id: int
    user_id: int
    split_data: dict
    splitwise_expense_id: Optional[int] = None

    class Config:
        from_attributes = True

class User(BaseModel):
    id: int
    splitwise_id: int
    email: str
    first_name: str
    last_name: Optional[str] = None
    picture: Optional[dict] = None
    groups: Optional[list] = None
    friends: Optional[list] = None

    class Config:
        from_attributes = True