import { useEffect, useState } from "react"
import { getPlan } from "./api"
import type { Plan } from "./types"
import IntakeView from "./views/IntakeView"
import PastPlans from "./views/PastPlans"
import PlanView from "./views/PlanView"

const PLAN_ID_KEY = "unstuck.planId"

function App() {
  const [plan, setPlan] = useState<Plan | null>(null)
  const [restoring, setRestoring] = useState(true)

  useEffect(() => {
    const savedId = localStorage.getItem(PLAN_ID_KEY)
    if (!savedId) {
      setRestoring(false)
      return
    }
    getPlan(Number(savedId))
      .then(setPlan)
      .catch(() => localStorage.removeItem(PLAN_ID_KEY))
      .finally(() => setRestoring(false))
  }, [])

  function handlePlanCreated(newPlan: Plan) {
    localStorage.setItem(PLAN_ID_KEY, String(newPlan.id))
    setPlan(newPlan)
  }

  async function handleOpenPlan(planId: number) {
    const openedPlan = await getPlan(planId)
    localStorage.setItem(PLAN_ID_KEY, String(openedPlan.id))
    setPlan(openedPlan)
  }

  function handleNewPlan() {
    localStorage.removeItem(PLAN_ID_KEY)
    setPlan(null)
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold">Unstuck</h1>
        <p className="text-charcoal/70">Less overthinking. More doing.</p>
      </header>

      {restoring ? (
        <p className="text-charcoal/70">Loading your plan...</p>
      ) : plan ? (
        <PlanView plan={plan} onPlanUpdated={setPlan} onNewPlan={handleNewPlan} />
      ) : (
        <>
          <IntakeView onPlanCreated={handlePlanCreated} />
          <PastPlans onOpenPlan={handleOpenPlan} />
        </>
      )}
    </main>
  )
}

export default App
