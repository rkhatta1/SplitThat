from fastapi import FastAPI
from app.api.endpoints import router as api_router

app = FastAPI(
    title="Splitwise Helper AI",
    description="An API to automate bill itemization using OCR and Generative AI.",
    version="1.0.0"
)

# Include the router from our endpoints file
app.include_router(api_router, prefix="/api/v1")

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to the Splitwise Helper AI API!"}