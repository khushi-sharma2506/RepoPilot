import redis


redis_client = redis.Redis(
    host="localhost",
    port=6379,
    decode_responses=True
)

def check_rate_limit(username: str):
    key = f"rate_limit:{username}"

    count = redis_client.incr(key)

    if count == 1:
        redis_client.expire(key, 60)

    if count > 10:
        return False

    return True