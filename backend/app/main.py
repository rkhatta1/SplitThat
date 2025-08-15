from fastapi import FastAPI
from app.api.endpoints import router as api_router
from app.api import auth as auth_router
from fastapi.middleware.cors import CORSMiddleware # New import

app = FastAPI(
    title="Splitwise Helper AI",
    description="An API to automate bill itemization using OCR and Generative AI.",
    version="1.0.0"
)

# New CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Allow your frontend origin
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods (GET, POST, etc.)
    allow_headers=["*"], # Allow all headers
)

# Include the router from our endpoints file
app.include_router(api_router, prefix="/api/v1")
app.include_router(auth_router.router, prefix="/api/v1")

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to the Splitwise Helper AI API!"}