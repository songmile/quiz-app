import { http, request } from "./http";
export function testConnection(apiIndex = 0) {
    return request(http.post("/ai/test-connection", { apiIndex }));
}
