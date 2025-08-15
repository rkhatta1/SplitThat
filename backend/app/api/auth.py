from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from splitwise import Splitwise
from app.core.config import settings
from app.core.database import get_db
from app.models.db_models import User
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
        groups_data = [{"id": g.getId(), "name": g.getName()} for g in groups]

        if not db_user:
            logger.info("User not found in DB, creating new user...")
            db_user = User(
                splitwise_id=user_id,
                email=current_user.getEmail(),
                first_name=current_user.getFirstName(),
                last_name=current_user.getLastName(),
                friends=friends_data,
                groups=groups_data,
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            logger.info("New user created and committed.")
        else:
            logger.info("User found in DB, updating user...")
            db_user.friends = friends_data
            db_user.groups = groups_data
            db.commit()
            logger.info("User updated and committed.")

        # Redirect to the frontend with the access token
        return RedirectResponse(f"http://localhost:5173/splitwise-callback?access_token={access_token['oauth_token']}&access_token_secret={access_token['oauth_token_secret']}")

    except Exception as e:
        logger.error(f"--- ERROR in auth_splitwise_callback: {e} ---")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not authenticate with Splitwise: {e}",
        )
