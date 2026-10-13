import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv

# load backend/.env
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.database import engine
from app.models import Base
from app.routes import plans
from app.services.ai_service import AIError
from app.services.planning_service import NoTaskFoundError


@asynccontextmanager
async def lifespan(app: FastAPI):
    # create the tables when the server starts
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Unstuck API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


app.include_router(plans.router)


@app.exception_handler(AIError)
def handle_ai_error(request: Request, exc: AIError):
    return JSONResponse(status_code=503, content={"detail": str(exc)})


@app.exception_handler(NoTaskFoundError)
def handle_no_tasks(request: Request, exc: NoTaskFoundError):
    return JSONResponse(status_code=422, content={"detail": str(exc)})


@app.exception_handler(SQLAlchemyError)
def handle_db_error(request: Request, exc: SQLAlchemyError):
    return JSONResponse(status_code=500, content={"detail": "I couldn't save your plan. Please try again."})
