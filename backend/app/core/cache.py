import redis
from app.core.config import settings

# Create a Redis connection pool
redis_pool = redis.ConnectionPool.from_url(settings.redis_url, decode_responses=True)

def get_redis():
    """Dependency to get a Redis connection from the pool."""
    r = redis.Redis(connection_pool=redis_pool)
    try:
        yield r
    finally:
        # The connection is automatically returned to the pool
        pass