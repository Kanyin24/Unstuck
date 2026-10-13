from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Plan, Task
from app.schemas import PlanCreate, PlanOut, PlanSummary, TaskUpdate
from app.services.ai_service import generate_plan
from app.services.planning_service import build_plan
from app.services.export_service import plan_to_text

router = APIRouter(prefix="/api/plans")

def get_plan_or_404(db: Session, plan_id: int) -> Plan:
    plan = db.get(Plan, plan_id)
    if plan is None:
        raise HTTPException(status_code=404, detail="Plan not found.")
    return plan

@router.post("", response_model=PlanOut, status_code = 201)
def create_plan(body: PlanCreate, db: Session = Depends(get_db)):
    today = date.today()
    ai_plan = generate_plan(body.brain_dump, body.available_minutes, body.energy_level, today)
    tasks = build_plan(ai_plan.tasks, body.available_minutes)

    plan = Plan(plan_date=today, available_minutes=body.available_minutes, energy_level=body.energy_level, tasks=tasks)
    db.add(plan)
    db.commit()
    return plan

@router.get("", response_model=list[PlanSummary])
def list_plans(db: Session = Depends(get_db)):
    plans = db.scalars(select(Plan).order_by(Plan.id.desc())).all()

    results = []
    for plan in plans:
        today_tasks = [task for task in plan.tasks if task.section == "today"]
        results.append(PlanSummary(
            id=plan.id,
            plan_date=plan.plan_date,
            available_minutes=plan.available_minutes,
            energy_level=plan.energy_level,
            completed_count=sum(1 for task in today_tasks if task.status == "completed"),
            today_count=len(today_tasks),
        ))
    return results

@router.get("/{plan_id}", response_model=PlanOut)
def get_plan(plan_id: int, db: Session = Depends(get_db)):
    return get_plan_or_404(db, plan_id)

@router.patch("/{plan_id}/tasks/{task_id}", response_model=PlanOut)
def update_task(plan_id: int, task_id: int, body: TaskUpdate, db: Session = Depends(get_db)):
    plan = get_plan_or_404(db, plan_id)
    task = db.get(Task, task_id)
    if task is None or task.plan_id != plan.id:
        raise HTTPException(status_code=404, detail="Task not found.")

    task.status = body.status
    db.commit()
    return plan

@router.get("/{plan_id}/export", response_class=PlainTextResponse)
def export_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = get_plan_or_404(db, plan_id)
    filename = f"unstuck-plan-{plan.plan_date}.txt"
    return PlainTextResponse(plan_to_text(plan), headers={"Content-Disposition": f'attachment; filename="{filename}"'})