import type { EnergyLevel, Plan, PlanSummary, TaskStatus } from "./types"

async function request(url: string, options?: RequestInit) {
  let response: Response
  try {
    response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    })
  } catch {
    throw new Error("I couldn't reach the server. Check your connection and try again.")
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const detail = typeof body?.detail === "string" ? body.detail : "Something went wrong. Please try again."
    throw new Error(detail)
  }
  return response.json()
}

export function createPlan(brain_dump: string, available_minutes: number, energy_level: EnergyLevel): Promise<Plan> {
  return request("/api/plans", {
    method: "POST",
    body: JSON.stringify({ brain_dump, available_minutes, energy_level }),
  })
}

export function listPlans(): Promise<PlanSummary[]> {
  return request("/api/plans")
}

export function getPlan(planId: number): Promise<Plan> {
  return request(`/api/plans/${planId}`)
}

export function updateTaskStatus(planId: number, taskId: number, status: TaskStatus): Promise<Plan> {
  return request(`/api/plans/${planId}/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}
