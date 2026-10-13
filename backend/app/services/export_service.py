from app.models import Plan

def plan_to_text(plan: Plan) -> str:
    today_tasks = sorted([task for task in plan.tasks if task.section == "today"], key=lambda task: task.priority_order)
    later_tasks = [task for task in plan.tasks if task.section == "later"]
    count_completed_tasks = sum(1 for task in today_tasks if task.status == "completed")

    lines = [
        f"Unstuck plan for {plan.plan_date.strftime('%A, %B %d, %Y')}",
        f"{plan.available_minutes} minutes available · {plan.energy_level.capitalize()} energy",
        f"{count_completed_tasks} of {len(today_tasks)} priorities completed",
        "",
        "FOCUS ON THESE TODAY",
    ]

    for task in today_tasks:
        check = "x" if task.status == "completed" else " "
        lines.append(f"[{check}] {task.priority_order}. {task.title} ({task.estimated_minutes} mins)")
        lines.append(f"    Why: {task.reason}")

    lines += ["", "LEAVE THESE FOR LATER"]
    for task in later_tasks:
        lines.append(f"- {task.title}")
        lines.append(f"    Why: {task.reason}")

    return "\n".join(lines) + "\n"