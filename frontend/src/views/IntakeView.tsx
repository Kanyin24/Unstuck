import { useState, type FormEvent } from "react"
import { createPlan } from "../api"
import type { EnergyLevel, Plan } from "../types"

const MAX_LENGTH = 5000

const TIME_OPTIONS = [
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
  { label: "3 hours", value: 180 },
]

const ENERGY_OPTIONS: { value: EnergyLevel; label: string; description: string }[] = [
  { value: "low", label: "Low", description: "I'm tired. Keep things manageable." },
  { value: "medium", label: "Medium", description: "I can get some things done." },
  { value: "high", label: "High", description: "I'm ready to focus." },
]

interface Props {
  onPlanCreated: (plan: Plan) => void
}

export default function IntakeView({ onPlanCreated }: Props) {
  const [brainDump, setBrainDump] = useState("")
  const [minutes, setMinutes] = useState<number | null>(null)
  const [energy, setEnergy] = useState<EnergyLevel | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!brainDump.trim()) {
      setError("Please tell me what's on your mind.")
      return
    }
    if (minutes === null || energy === null) {
      setError("Please choose how much time you have and your energy level.")
      return
    }

    setError(null)
    setLoading(true)
    try {
      const plan = await createPlan(brainDump, minutes, energy)
      onPlanCreated(plan)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Feeling overwhelmed?</h2>
        <p className="mt-1 text-charcoal/70">
          Get everything out of your head. I'll help you figure out what matters most and what can wait.
        </p>
      </div>

      <div>
        <label htmlFor="brain-dump" className="block font-medium">What's on your mind?</label>
        <p className="text-sm text-charcoal/70">
          Write down everything you need to do, what's weighing on you or what you're struggling to organize.
          Include deadlines if you know them. It doesn't have to be organized.
        </p>
        <textarea
          id="brain-dump"
          value={brainDump}
          onChange={(e) => setBrainDump(e.target.value)}
          maxLength={MAX_LENGTH}
          rows={7}
          placeholder="e.g. I have an interview tomorrow that I haven't prepared for, an assignment due Friday, a few emails to send and my room is a mess. I don't know where to start..."
          className="mt-2 w-full rounded-xl border border-charcoal/15 bg-white p-4"
        />
        <div className="flex justify-between gap-4 text-xs text-charcoal/60">
          <span>You can write in sentences, bullet points or whatever feels natural.</span>
          <span className="shrink-0">{brainDump.length} / {MAX_LENGTH}</span>
        </div>
      </div>

      <div>
        <p className="font-medium">How much time do you have today?</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {TIME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMinutes(option.value)}
              className={`rounded-full border px-4 py-2 ${minutes === option.value ? "border-sage bg-sage text-white" : "border-charcoal/15 bg-white"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="font-medium">How's your energy today?</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {ENERGY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setEnergy(option.value)}
              className={`rounded-xl border p-3 text-left ${energy === option.value ? "border-sage bg-sage/10" : "border-charcoal/15 bg-white"}`}
            >
              <span className="block font-medium">{option.label}</span>
              <span className="block text-sm text-charcoal/70">{option.description}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 p-3 text-red-800">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-sage px-6 py-3 font-medium text-white disabled:opacity-60 sm:w-auto"
      >
        {loading ? "Sorting through your thoughts..." : "Help me get unstuck →"}
      </button>
    </form>
  )
}
