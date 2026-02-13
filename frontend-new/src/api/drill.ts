import { http, request } from "./http";

export function startDrill(count = 20) {
  return request<Record<string, unknown>>(http.post("/drill/start", { count }));
}

export function getDrillAnalysis() {
  return request<unknown>(http.get("/drill/analysis"));
}
