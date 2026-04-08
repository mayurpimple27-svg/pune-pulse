# Pune Pulse — Hyper-Local Intelligence Platform

A production-grade full-stack web application providing real-time, hyper-local intelligence for Pune city.

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌────────────┐
│  React + TS     │────▶│  Spring Boot 3.x     │────▶│ PostgreSQL │
│  (Vite, TW CSS) │     │  JWT Auth, RBAC      │     │  (ACID)    │
│  Port: 5173     │     │  Port: 8080          │     │  Port: 5432│
└─────────────────┘     └──────────────────────┘     └────────────┘
                               │
                        ┌──────┴──────┐
                        │ Pulse Agent │
                        │ (Scheduled) │
                        └─────────────┘
```

## Prerequisites

- **Java 21+** (JDK)
- **PostgreSQL 15+**
- **Node.js 18+** & npm
- **Maven 3.9+**

## Setup

### 1. Database

```sql
CREATE DATABASE punepulse;
```

Or run the schema manually:

```bash
psql -U postgres -d punepulse -f pune-pulse-backend/src/main/resources/schema.sql
```

### 2. Backend

```bash
cd pune-pulse-backend

# Set environment variables (or use defaults in application.yml)
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
export JWT_SECRET=your-256-bit-secret-key-for-jwt-signing-in-production

# Build & run
mvn clean install
mvn spring-boot:run
```

Backend starts at `http://localhost:8080/api`

### 3. Frontend

```bash
cd pune-pulse-frontend
npm install
npm run dev
```

Frontend starts at `http://localhost:5173` with API proxy to backend.

## Features

- **Dashboard**: Personalized alert feed based on area subscriptions
- **Intelligence Feed**: Public filterable alert list (category + area)
- **Ask Pune Chat**: Conversational Q&A interface over alert data
- **Auth**: JWT in HttpOnly cookies, BCrypt passwords, RBAC
- **Rate Limiting**: 60 requests/min per IP via Bucket4j
- **AI Agent**: Scheduled task that fetches, analyzes, and persists alerts (mock data)
- **Mobile Responsive**: Tailwind CSS responsive design

## Project Structure

```
pune-pulse-backend/
├── src/main/java/com/punepulse/
│   ├── agent/           # Scheduled AI agent service
│   ├── config/          # Security, CORS, rate limiting
│   ├── controller/      # REST controllers
│   ├── dto/             # Request/Response DTOs
│   ├── entity/          # JPA entities & enums
│   ├── exception/       # Global exception handling
│   ├── repository/      # Spring Data JPA repos
│   ├── security/        # JWT, filters, UserDetails
│   └── service/         # Business logic

pune-pulse-frontend/
├── src/
│   ├── api/             # Axios API client
│   ├── components/      # Reusable UI components
│   ├── context/         # Auth context provider
│   ├── pages/           # Page components (4 pages)
│   └── types/           # TypeScript types
```
