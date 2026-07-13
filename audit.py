from sqlalchemy import text

def save_audit(db, endpoint: str, method: str, username: str):
    db.execute(
        text("""
            INSERT INTO audit_logs (endpoint, method, username)
            VALUES (:endpoint, :method, :username)
        """),
        {
            "endpoint": endpoint,
            "method": method,
            "username": username
        }
    )
    db.commit()