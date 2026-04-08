export type AlertCategory = "TRAFFIC" | "POWER" | "WATER" | "EVENT";
export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Alert {
  id: string;
  title: string;
  summary: string;
  category: AlertCategory;
  sourceUrl: string | null;
  confidenceScore: number;
  areaTag: string;
  isVerified: boolean;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
  first: boolean;
}

export interface ChatResponse {
  answer: string;
  relatedAlerts: Alert[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface NewsArticle {
  title: string;
  summary: string;
  source: string;
  url: string;
  published: string;
  category: string;
  area: string | null;
  imageUrl?: string | null;
}

export interface TrafficHotspot {
  area: string;
  lat: number;
  lng: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
  description: string;
  updated: string;
}
