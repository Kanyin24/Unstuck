from datetime import date
from sqlalchemy import ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class Plan(Base):
    __tablename__ = "plans"

    id: Mapped[int] = mapped_column(primary_key=True)
    plan_date: Mapped[date]
    available_minutes: Mapped[int]
    energy_level: Mapped[str]
    tasks: Mapped[list["Task"]] = relationship(back_populates="plan", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    plan_id: Mapped[int] = mapped_column(ForeignKey("plans.id", ondelete="CASCADE"))
    title: Mapped[str]
    due_date: Mapped[date | None]
    section: Mapped[str]
    status: Mapped[str] = mapped_column(default="pending")
    priority_order: Mapped[int | None]
    estimated_minutes: Mapped[int]
    reason: Mapped[str]
    plan: Mapped["Plan"] = relationship(back_populates="tasks")
