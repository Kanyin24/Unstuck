export type Section = "today" | "later"
export type TaskStatus = "pending" | "completed"
export type EnergyLevel = "low" | "medium" | "high"

export interface Task {
  id: number
  title: string
  due_date: string | null
  section: Section
  status: TaskStatus
  priority_order: number | null
  estimated_minutes: number
  reason: string
}

export interface Plan {
  id: number
  plan_date: string
  available_minutes: number
  energy_level: EnergyLevel
  tasks: Task[]
}

export interface PlanSummary {
  id: number
  plan_date: string
  available_minutes: number
  energy_level: EnergyLevel
  completed_count: number
  today_count: number
}
