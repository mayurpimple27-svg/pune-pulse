import axios from "axios";
import type {
  Alert,
  ApiResponse,
  ChatResponse,
  LoginRequest,
  NewsArticle,
  PageResponse,
  RegisterRequest,
  TrafficHotspot,
  User,
  AlertCategory,
} from "../types";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Auth
export const login = (data: LoginRequest) =>
  api.post<ApiResponse<User>>("/auth/login", data);

export const register = (data: RegisterRequest) =>
  api.post<ApiResponse<User>>("/auth/register", data);

export const logout = () => api.post<ApiResponse<void>>("/auth/logout");

export const getMe = () => api.get<ApiResponse<User>>("/auth/me");

// Alerts
export const getAlerts = (params: {
  page?: number;
  size?: number;
  category?: AlertCategory | "";
  areaTag?: string;
}) => api.get<ApiResponse<PageResponse<Alert>>>("/alerts", { params });

export const getAlertById = (id: string) =>
  api.get<ApiResponse<Alert>>(`/alerts/${id}`);

// Areas
export const getAreas = () => api.get<ApiResponse<string[]>>("/areas");

// Subscriptions
export const getSubscriptions = () =>
  api.get<ApiResponse<string[]>>("/subscriptions");

export const subscribe = (areaTag: string) =>
  api.post<ApiResponse<void>>("/subscriptions", { areaTag });

export const unsubscribe = (areaTag: string) =>
  api.delete<ApiResponse<void>>(
    `/subscriptions/${encodeURIComponent(areaTag)}`,
  );

// Dashboard
export const getDashboard = (page: number = 0, size: number = 20) =>
  api.get<ApiResponse<PageResponse<Alert>>>("/dashboard", {
    params: { page, size },
  });

// Chat
export const askPune = (question: string) =>
  api.post<ApiResponse<ChatResponse>>("/chat", { question });

// News (from Python scraper via backend)
export const getNews = (params?: { category?: string; limit?: number }) =>
  api.get<ApiResponse<NewsArticle[]>>("/news", { params });

// Traffic
export const getTrafficHotspots = () =>
  api.get<ApiResponse<TrafficHotspot[]>>("/traffic/hotspots");

export default api;
