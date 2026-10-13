import { useEffect, useState } from "react"
import { listPlans } from "../api"
import { formatDate, formatMinutes } from "../format"
import type { PlanSummary } from "../types"

interface Props {
  onOpenPlan: (planId: number) => Promise<void>
}

export default function PastPlans({ onOpenPlan }: Props) {
  const [plans, setPlans] = useState<PlanSummary[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listPlans()
      .then(setPlans)
      .catch(() => setError("I couldn't load your past plans."))
  }, [])

  if (error) return <p className="mt-12 text-sm text-charcoal/60">{error}</p>
  if (plans.length === 0) return null

  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold">Past plans</h2>
      <ul className="mt-3 space-y-2">
        {plans.map((plan) => (
          <li key={plan.id}>
            <button
              onClick={() => onOpenPlan(plan.id).catch(() => setError("I couldn't open that plan."))}
              className="w-full rounded-xl border border-charcoal/10 bg-white p-3 text-left hover:border-sage"
            >
              <span className="block font-medium">{formatDate(plan.plan_date)}</span>
              <span className="block text-sm text-charcoal/70">
                {formatMinutes(plan.available_minutes)} · {plan.energy_level} energy · {plan.completed_count} of {plan.today_count} done
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
