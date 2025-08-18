from sqlalchemy import Column, Integer, String, JSON, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    splitwise_id = Column(Integer, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    # Storing groups and friends as JSON for simplicity
    groups = Column(JSON)
    friends = Column(JSON)
    splitwise_access_token = Column(JSON)
    hashed_refresh_token = Column(String, nullable=True)

    splits = relationship("Split", back_populates="user")

class Split(Base):
    __tablename__ = "splits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    split_data = Column(JSON)
    splitwise_expense_id = Column(BigInteger, nullable=True, unique=True)

    user = relationship("User", back_populates="splits")
