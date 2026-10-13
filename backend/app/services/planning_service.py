# take task list and make sure all the necessary rules are followed.
# these are some of the important rules (error handling):
# - No blank tasks & no tasks with 0 or negative minutes
# - No duplicate tasks

from app.models import Task
from app.schemas import AITask

class NoTaskFoundError(Exception):
    pass


def build_plan(ai_tasks: list[AITask], available_minutes: int) -> list[Task]:
    ai_tasks.sort(key=lambda t: t.rank) # sort tasks by importance/priority

    results = []
    count_today_tasks = 0
    total_today_mins = 0
    seen_titles = set()

    for ai_task in ai_tasks:
        ai_task_title = ai_task.title.strip()
        if not ai_task_title or ai_task.estimated_minutes <= 0:
            continue

        if ai_task_title.lower() in seen_titles:
            continue
        seen_titles.add(ai_task_title.lower())

        if ai_task.recommended_section == "today" and count_today_tasks < 3 and total_today_mins + ai_task.estimated_minutes <= available_minutes:
            count_today_tasks += 1
            total_today_mins += ai_task.estimated_minutes
            section = "today"
            priority_order = count_today_tasks
            reason = ai_task.reason
        else:
            section = "later"
            priority_order = None
            if ai_task.recommended_section == "today":
                reason = "Moved to Later so today's plan fits your available time."
            else:
                reason = ai_task.reason

        results.append(Task(
            title=ai_task_title, 
            due_date=ai_task.due_date,
            section=section,
            priority_order=priority_order,
            estimated_minutes=ai_task.estimated_minutes,
            reason=reason
        ))
    if not results:
        raise NoTaskFoundError("I couldn't find specific tasks. Try listing a few things you need to do.")

    return results
