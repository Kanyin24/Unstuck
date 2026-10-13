import { useState } from "react"
import { updateTaskStatus } from "../api"
import { formatDate, formatMinutes } from "../format"
import type { Plan, Task } from "../types"

interface Props {
  plan: Plan
  onPlanUpdated: (plan: Plan) => void
  onNewPlan: () => void
}

export default function PlanView({ plan, onPlanUpdated, onNewPlan }: Props) {
  const [savingTaskId, setSavingTaskId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const todayTasks = plan.tasks
    .filter((task) => task.section === "today")
    .sort((a, b) => (a.priority_order ?? 0) - (b.priority_order ?? 0))
  const laterTasks = plan.tasks.filter((task) => task.section === "later")
  const completedCount = todayTasks.filter((task) => task.status === "completed").length
  const energyLabel = plan.energy_level[0].toUpperCase() + plan.energy_level.slice(1)

  async function toggleTask(task: Task) {
    setSavingTaskId(task.id)
    setError(null)
    try {
      const newStatus = task.status === "completed" ? "pending" : "completed"
      onPlanUpdated(await updateTaskStatus(plan.id, task.id, newStatus))
    } catch (err) {
      setError(err instanceof Error ? err.message : "I couldn't save that change. Please try again.")
    } finally {
      setSavingTaskId(null)
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-2xl font-semibold">Your focus for today</h2>
        <p className="mt-1 text-charcoal/70">You don't have to do everything today. Here's where to focus.</p>
        <p className="mt-3 text-sm text-charcoal/70">
          {formatMinutes(plan.available_minutes)} available · {energyLabel} energy
        </p>
        <div className="mt-3">
          <p className="text-sm font-medium">{completedCount} of {todayTasks.length} priorities completed</p>
          <div className="mt-1 h-2 rounded-full bg-lavender">
            <div
              className="h-2 rounded-full bg-sage transition-all"
              style={{ width: `${todayTasks.length ? (completedCount / todayTasks.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </section>

      {error && <p className="rounded-xl bg-red-50 p-3 text-red-800">{error}</p>}

      <section>
        <h3 className="text-lg font-semibold">Focus on these today</h3>
        <ul className="mt-3 space-y-3">
          {todayTasks.map((task) => {
            const done = task.status === "completed"
            return (
              <li key={task.id} className="rounded-xl border border-charcoal/10 bg-white p-4">
                <label className="flex cursor-pointer gap-3">
                  <input
                    type="checkbox"
                    checked={done}
                    disabled={savingTaskId === task.id}
                    onChange={() => toggleTask(task)}
                    className="mt-1 h-5 w-5 shrink-0 accent-sage"
                  />
                  <div>
                    <p className={`font-medium ${done ? "line-through text-charcoal/50" : ""}`}>
                      {task.priority_order}. {task.title}
                    </p>
                    <p className="text-sm text-charcoal/70">
                      Suggested time: {task.estimated_minutes} minutes
                      {task.due_date && ` · Due ${formatDate(task.due_date)}`}
                    </p>
                    <p className="mt-1 text-sm">{task.reason}</p>
                  </div>
                </label>
              </li>
            )
          })}
        </ul>
      </section>

      {laterTasks.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold">Leave these for later</h3>
          <p className="text-sm text-charcoal/70">These still matter. You just don't need to tackle them all right now.</p>
          <ul className="mt-3 space-y-2">
            {laterTasks.map((task) => (
              <li key={task.id} className="rounded-xl bg-lavender/50 p-3">
                <p className="font-medium">{task.title}</p>
                <p className="text-sm text-charcoal/70">{task.reason}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <a
          href={`/api/plans/${plan.id}/export`}
          className="rounded-full border border-sage px-5 py-2 font-medium text-sage"
        >
          Download as text
        </a>
        <button onClick={onNewPlan} className="rounded-full bg-sage px-5 py-2 font-medium text-white">
          Create a new plan
        </button>
      </div>
    </div>
  )
}
