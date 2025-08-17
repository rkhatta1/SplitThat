from app.core.database import engine
from app.models.db_models import Base

def drop_tables():
    print("Dropping database tables...")
    Base.metadata.drop_all(bind=engine)
    print("Database tables dropped.")

if __name__ == "__main__":
    drop_tables()
