from models import database, schema
from sqlalchemy import text

db = database.SessionLocal()
try:
    # Check if we need to create the users table
    schema.Base.metadata.create_all(bind=database.engine)
    
    # Try adding the owner_id column to projects manually
    db.execute(text("ALTER TABLE projects ADD COLUMN owner_id VARCHAR;"))
    db.execute(text("ALTER TABLE projects ADD CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES users(id);"))
    db.commit()
    print("Successfully added owner_id to projects table.")
except Exception as e:
    print("Error:", e)
finally:
    db.close()
