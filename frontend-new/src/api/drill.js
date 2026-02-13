import { http, request } from "./http";
export function startDrill(count = 20) {
    return request(http.post("/drill/start", { count }));
}
export function getDrillAnalysis() {
    return request(http.get("/drill/analysis"));
}
