from pydantic import BaseModel, ConfigDict, StringConstraints
from typing import Annotated, Literal
from datetime import date

class PlanCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    brain_dump: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=5000)]
    available_minutes: Literal[30, 60, 120, 180]
    energy_level: Literal["low", "medium", "high"]

class AITask(BaseModel):
    title: str
    due_date: date | None
    recommended_section: Literal["today", "later"]
    rank: int
    estimated_minutes: int
    reason: str

class AIPlan(BaseModel):
    tasks: list[AITask]

class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    due_date: date | None
    section: str
    status: str
    priority_order: int | None
    estimated_minutes: int
    reason: str

class PlanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    plan_date: date
    available_minutes: int
    energy_level: str
    tasks: list[TaskOut]

class PlanSummary(BaseModel):
    id: int
    plan_date: date
    available_minutes: int
    energy_level: str
    completed_count: int
    today_count: int

class TaskUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    status: Literal["pending", "completed"]