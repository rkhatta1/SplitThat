from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """Loads environment variables from the .env file."""
    google_api_key: str
    splitwise_consumer_key: str
    splitwise_consumer_secret: str
    database_url: str
    jwt_secret_key: str
    jwt_algorithm: str

    # This tells Pydantic to load variables from a .env file
    model_config = SettingsConfigDict(env_file="../.env")

settings = Settings()