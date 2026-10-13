import os

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./unstuck.db")

# needed because fastapi uses multiple threads
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# turn on foreign keys so deleting a plan deletes its tasks
@event.listens_for(engine, "connect")
def enable_foreign_keys(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

# gives each request its own db session and closes it after
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
