import axios from "axios";
export const http = axios.create({
    baseURL: "/api",
    timeout: 30000,
    headers: {
        "Content-Type": "application/json"
    }
});
http.interceptors.response.use((response) => response, (error) => {
    const message = error?.response?.data?.message ?? error?.message ?? "Request failed";
    return Promise.reject(new Error(message));
});
export async function request(promise) {
    const response = await promise;
    const body = response.data;
    if (body.code !== 0) {
        throw new Error(body.message || "Request failed");
    }
    return body.data;
}
