from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from splitwise import Splitwise
from app.core.config import settings
from app.core.database import get_db
from app.models.db_models import User
from app.core.security import create_access_token, create_refresh_token, get_hashed_token, verify_token_hash
from app.models.schemas import RefreshTokenRequest
from jose import jwt
import logging

print("--- auth.py module is being imported ---")

router = APIRouter()

logger = logging.getLogger(__name__)

# This is a temporary, in-memory storage for the OAuth secret.
# In a production application, you should use a more robust session management system.
temp_secret_storage = {}

s_obj = Splitwise(
    consumer_key=settings.splitwise_consumer_key,
    consumer_secret=settings.splitwise_consumer_secret,
)

@router.get("/auth/splitwise")
def auth_splitwise():
    """
    Redirects the user to Splitwise to authorize the application.
    """
    auth_url, secret = s_obj.getAuthorizeURL()
    # Store the secret in a secure way (e.g., session, database)
    # For now, we'll just pass it to the callback URL for simplicity in this example
    # In a real application, you should use a more secure method.
    temp_secret_storage['secret'] = secret
    return RedirectResponse(auth_url)

@router.get("/auth/splitwise/callback")
def auth_splitwise_callback(oauth_token: str, oauth_verifier: str, db: Session = Depends(get_db)):
    logger.info("--- In auth_splitwise_callback ---")
    try:
        secret = temp_secret_storage.get('secret')
        if not secret:
            raise HTTPException(status_code=400, detail="Could not find secret")

        access_token = s_obj.getAccessToken(oauth_token, secret, oauth_verifier)
        logger.info(f"Access token received: {access_token}")
        s_obj.setAccessToken(access_token)

        current_user = s_obj.getCurrentUser()
        logger.info(f"Current user: {current_user.__dict__}")
        user_id = current_user.getId()

        friends = s_obj.getFriends()
        logger.info(f"Friends: {[f.__dict__ for f in friends]}")
        groups = s_obj.getGroups()
        logger.info(f"Groups: {[g.__dict__ for g in groups]}")

        db_user = db.query(User).filter(User.splitwise_id == user_id).first()
        logger.info(f"User found in DB: {db_user is not None}")

        friends_data = [{"id": f.getId(), "first_name": f.getFirstName(), "last_name": f.getLastName(), "email": f.getEmail()} for f in friends]
        groups_data = []
        for g in groups:
            members = g.getMembers()
            members_data = [{"id": m.getId(), "first_name": m.getFirstName(), "last_name": m.getLastName(), "email": m.getEmail()} for m in members]
            groups_data.append({"id": g.getId(), "name": g.getName(), "members": members_data})

        if not db_user:
            logger.info("User not found in DB, creating new user...")
            db_user = User(
                splitwise_id=user_id,
                email=current_user.getEmail(),
                first_name=current_user.getFirstName(),
                last_name=current_user.getLastName(),
                friends=friends_data,
                groups=groups_data,
                splitwise_access_token=access_token
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            logger.info("New user created and committed.")
        else:
            logger.info("User found in DB, updating user...")
            db_user.friends = friends_data
            db_user.groups = groups_data
            db_user.splitwise_access_token = access_token
            db.commit()
            logger.info("User updated and committed.")

        # Create a JWT for the user
        access_token_jwt = create_access_token(data={"sub": str(db_user.id)})
        refresh_token_jwt = create_refresh_token(data={"sub": str(db_user.id)})

        # Store the hashed refresh token in the database
        db_user.hashed_refresh_token = get_hashed_token(refresh_token_jwt)
        db.commit()

        # Redirect to the frontend with the JWTs
        return RedirectResponse(f"http://localhost:5173/login-success?token={access_token_jwt}&refresh_token={refresh_token_jwt}")

    except Exception as e:
        logger.error(f"--- ERROR in auth_splitwise_callback: {e} ---")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not authenticate with Splitwise: {e}",
        )

@router.post("/auth/refresh-token")
def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Refreshes the access token.
    """
    try:
        payload = jwt.decode(request.refresh_token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")

        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        if not verify_token_hash(request.refresh_token, user.hashed_refresh_token):
            raise HTTPException(status_code=401, detail="Invalid token")

        access_token_jwt = create_access_token(data={"sub": str(user.id)})
        return {"access_token": access_token_jwt}

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
