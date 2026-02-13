import axios from "axios";

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export const http = axios.create({
  baseURL: "/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  }
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message ?? error?.message ?? "Request failed";
    return Promise.reject(new Error(message));
  }
);

export async function request<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise;
  const body = response.data;
  if (body.code !== 0) {
    throw new Error(body.message || "Request failed");
  }
  return body.data;
}
