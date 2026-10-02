<div align="center">

# 🎓 SellOnCampus

### *Direct student-to-student marketplace built exclusively for university life.*

Buy and sell textbooks, electronics, cycles, and dorm essentials securely with verified campus peers.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js%2016-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![WebSockets](https://img.shields.io/badge/WebSockets-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [Environment Configuration](#-environment-configuration)
- [Directory Structure](#-directory-structure)
- [Security & Architecture Highlights](#-security--architecture-highlights)
- [License](#-license)

---

## 🌟 Overview

**SellOnCampus** replaces chaotic campus WhatsApp groups and disorganized social media feeds with a verified, structured peer-to-peer student marketplace. 

Designed specifically for university ecosystems, it connects students within verified campus domains (e.g. `@vit.edu.in`) to buy, sell, or trade items directly on campus with built-in instant messaging, meeting coordinate suggestions, and real-time alerts.

---

## ✨ Key Features

### 🛡️ Verified Student Authentication
- **College-Only Registration**: Signups require a verified university email address (`@vit.edu.in`).
- **OTP Verification**: Email verification via 4-digit numeric OTP sent directly via SMTP without requiring third-party domain purchases.
- **Secure Sessions**: Dual-token authentication with short-lived JWT Access Tokens and persistent Refresh Tokens stored in secure `HttpOnly`, `SameSite=Lax` cookies.

### 🛍️ Marketplace & Smart Discovery
- **Comprehensive Catalog**: Dedicated campus categories—*Books & Notes*, *Electronics & Tech*, *Hostel & Dorm Gear*, *Cycles & Transport*, *Furniture & Decor*, and *Lab Equipment*.
- **Multi-Faceted Filtering**: Filter concurrently by category, condition (*Brand New*, *Like New*, *Good*, *Fair*), and price ranges.
- **Full-Text Keyword Search**: Real-time keyword search indexing titles, descriptions, models, and brands.
- **Flexible Views & Sorting**: Grid and List layout modes with sorting by newest, price (low-to-high, high-to-low), and recency.
- **Sub-Millisecond Redis Caching**: Hot listing details, category trees, and search results cached in-memory with automatic cache-aside invalidation.

### 📸 Seller Dashboard & Listing Lifecycle
- **Listing Creation**: Upload item photos directly to Cloudinary with title, description, price, condition, brand, and model details.
- **Status Lifecycle**: Toggle listings between **Active**, **Reserved**, and **Sold**.
- **Owner Controls**: Strict authorization checks ensuring only the listing author can modify, mark status, or remove listings.

### 💬 Real-Time Campus Chat
- **Instant Messaging**: Low-latency WebSocket connections with typed event envelopes.
- **Sequence Numbering & Read Receipts**: Live synchronization of read status and sequence tracking.
- **Optimistic UI & Deduplication**: Outgoing messages render immediately with duplicate-suppression guards across racing tabs.

### 🔔 Live Notifications
- **Real-Time Badge Updates**: Global navbar badge updates for incoming chats and alerts.
- **Interactive Notification Popover**: Quick desktop preview dropdown with direct link to active threads.

### ⚡ Redis Caching, Rate Limiting & Abuse Prevention
- **Cache-Aside Pattern**: In-memory Redis caching for hot entities (`listing:{id}`, search queries, and categories) with targeted invalidation on create/update/delete.
- **Atomic Lua Rate Limiting**: Zero-race-condition rate limiting implemented via Redis atomic `INCR` + `EXPIRE` Lua scripts.
- **Dual-Layer Auth Protection**: Correlated IP and email-based limiting on OTP requests and password resets to prevent SMTP quota exhaustion and brute-force attacks.
- **Quota & Resource Guards**: Per-user limits on listing creation (10 listings/hour, protecting image upload pipelines) and instant messaging (30 messages/minute).
- **RFC Standard Headers**: Automatically provides `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and standard `Retry-After` on `429 Too Many Requests`.

### 🎨 Premium Design System
- **Stitch Design System**: Custom HSL palette featuring warm campus terracotta/orange (`#F95A1E`), charcoal typography, and canvas neutrals.
- **Modern Typography**: Styled using Google Font **Plus Jakarta Sans**.
- **Responsive Layout**: Edge-to-edge desktop layout with bottom navigation drawer for mobile.

---

## 🏗️ Architecture

```mermaid
graph TD
    subgraph Browser ["Client Application (Next.js 16 + React 19)"]
        UI["UI Components & Pages"]
        AuthCtx["AuthContext (Cookie Sessions)"]
        SocketCtx["SocketProvider (Reconnection Lifecycle)"]
    end

    subgraph Backend ["Backend API (Express 5 + TypeScript)"]
        HTTP["Express HTTP Endpoints"]
        RateLimit["Rate Limiter (Redis Lua Scripts)"]
        AuthMiddleware["JWT Cookie Handshake & Verification"]
        Services["Business Services (Listings, Auth, Chat)"]
        CacheLayer["Redis Cache-Aside (Get / Set / Evict)"]
        WSServer["WebSocket Server ('ws')"]
        EmailService["Nodemailer (Gmail SMTP)"]
    end

    subgraph DataStore ["Data & Media Services"]
        NeonDB[("PostgreSQL (Neon Serverless)")]
        RedisDB[("Redis (Rate Limiting & Distributed Cache)")]
        Cloudinary["Cloudinary CDN (Listing Images)"]
    end

    UI --> AuthCtx
    UI --> SocketCtx
    AuthCtx <-->|"HTTP REST (HttpOnly Cookies)"| HTTP
    SocketCtx <-->|"WSS Protocol (Cookie Handshake)"| WSServer
    HTTP --> RateLimit
    RateLimit -->|"Atomic INCR & TTL"| RedisDB
    HTTP --> AuthMiddleware
    AuthMiddleware --> Services
    Services <-->|"Cache-Aside (Listings, Queries, Categories)"| CacheLayer
    CacheLayer <--> RedisDB
    Services <-->|"Prisma ORM"| NeonDB
    HTTP --> Cloudinary
    HTTP --> EmailService
    WSServer --> NeonDB
```

---

## 💻 Tech Stack

### Frontend
| Technology | Description |
| :--- | :--- |
| **Next.js 16** | App Router architecture, Turbopack, and SSR/SSG capabilities |
| **React 19** | Latest React features and concurrency hooks |
| **Tailwind CSS v4** | Modern utility-first styling with custom theme tokens |
| **Lucide React** | Consistent iconography across mobile and desktop views |
| **WebSocket Client** | Reconnection engine with exponential backoff & intentional close tracking |

### Backend
| Technology | Description |
| :--- | :--- |
| **Node.js & Express 5** | RESTful API server with TypeScript runtime |
| **Prisma ORM 7** | Type-safe database queries and migrations |
| **PostgreSQL (Neon)** | Cloud serverless relational database |
| **Redis** | In-memory cache-aside store (listings, search queries, categories) & atomic Lua rate limiter |
| **`ws` Library** | Native WebSockets with heartbeat detection and client connection manager |
| **Nodemailer** | SMTP mail delivery with Google App Password integration |
| **Cloudinary** | Cloud storage and optimized image CDN |
| **Argon2** | Secure password hashing algorithm |
| **Zod** | Request body and query parameter validation |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.17+ or v20+ recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A free [Neon](https://neon.tech/) PostgreSQL database (or any PostgreSQL instance)
- A [Redis](https://redis.io/) instance (local or hosted via [Upstash](https://upstash.com/) / [Redis Cloud](https://redis.com/try-free/))
- A free [Cloudinary](https://cloudinary.com/) account for image uploads
- A Google Account with 2-Step Verification enabled (to generate a free 16-character [App Password](https://myaccount.google.com/apppasswords))

---

### 1. Backend Setup

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file inside the `backend` folder:
   ```env
   # Database (Neon or PostgreSQL)
   DATABASE_URL="postgresql://user:password@your-neon-host/neondb?sslmode=require"

   # Redis (Local or Upstash / Redis Cloud)
   REDIS_URL="redis://localhost:6379"

   # JWT Secrets (Generate with openssl rand -base64 64)
   JWT_ACCESS_SECRET="your-access-secret"
   JWT_REFRESH_SECRET="your-refresh-secret"
   JWT_RESET_SECRET="your-reset-secret"

   # SMTP Email Service (Gmail SMTP with App Password)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_16_char_google_app_password
   SMTP_FROM="SellOnCampus <your_email@gmail.com>"

   # Development Bypass / Whitelisted Test Email
   DEV_TEST_EMAIL=your_email@gmail.com

   # Cloudinary Media Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   NODE_ENV=development
   ```

4. Push the Prisma schema to your database:
   ```bash
   npx prisma db push
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will boot on `http://localhost:5000` with WebSocket support.*

---

### 2. Frontend Setup

1. In a separate terminal, navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env.local` file inside the `frontend` folder:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_WS_URL=ws://localhost:5000
   NEXT_PUBLIC_LOGO_URL=https://res.cloudinary.com/tiuyn5qd/image/upload/v1790440326/logo.jpg
   NEXT_PUBLIC_FAVICON_URL=https://res.cloudinary.com/tiuyn5qd/image/upload/v1790494828/logo-favicon.png
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

5. Open your browser and visit:
   ```
   http://localhost:3000
   ```

---

## 📁 Directory Structure

```text
SellOnCampus/
├── backend/
│   ├── prisma/
│   │   └── schema/              # Modular Prisma schema models
│   ├── src/
│   │   ├── controllers/         # Express endpoint controllers
│   │   ├── lib/                 # Core utilities (auth, errors, prisma, tokens, redis)
│   │   ├── middleware/          # Auth guards, rate limiting engine, uploads, and Zod validation
│   │   ├── routes/              # Express API route modules
│   │   ├── services/            # Database and business logic layer
│   │   ├── types/               # TypeScript global declarations
│   │   ├── utils/               # Route-specific rate limit presets & helper utilities
│   │   ├── validators/          # Zod validation schemas
│   │   ├── websocket/           # WebSocket server, auth, and connection manager
│   │   ├── app.ts               # Express configuration & CORS
│   │   └── server.ts            # HTTP & WebSocket initialization
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/              # Login, register, forgot/reset password
│   │   ├── conversations/       # Real-time chat & inbox
│   │   ├── listings/            # Marketplace search, details, and creation
│   │   ├── my-listings/         # Seller item management
│   │   ├── notifications/       # User notifications feed
│   │   ├── profile/             # Student account & settings
│   │   ├── layout.tsx           # Root layout & font injection
│   │   └── page.tsx             # Marketplace home page
│   ├── components/
│   │   ├── layout/              # Glass navbar, footer, mobile nav, app shell
│   │   ├── marketplace/         # Filters, search bar, item cards, drawers
│   │   ├── ui/                  # Atomic buttons, inputs, avatars, badges, skeletons
│   │   └── ...
│   ├── lib/                     # Auth context, WebSocket context, utilities, types
│   ├── package.json
│   └── next.config.ts
│
├── docs/                        # Architecture documentation and roadmap
└── README.md
```

---

## 🔒 Security & Architecture Highlights

- **Cache-Aside Architecture & TTLs**: Read-heavy marketplace endpoints (`listing:{id}`, category hierarchies, paginated query caches) leverage Redis cache-aside with granular TTLs, shielding PostgreSQL from repeat read spikes and providing sub-millisecond responses.
- **Atomic Cache Consistency & Targeted Eviction**: Listing edits, deletions, and status toggles (`Active` -> `Reserved` -> `Sold`) trigger immediate atomic cache invalidation (`deleteCache`), eliminating split-brain states across campus buyers and sellers.
- **Atomic Redis Rate Limiting**: Distributed abuse mitigation powered by Redis and atomic Lua scripting (`INCR` + `EXPIRE` on first touch), guaranteeing race-condition-free quota enforcement without distributed locking overhead.
- **Fail-Open Fault Tolerance**: If the Redis instance temporarily disconnects or errors, the rate limiter logs the exception and gracefully permits requests to flow rather than causing system-wide outages.
- **Pre-Upload Quota Enforcements**: Authenticated endpoints like listing creation enforce rate limits *before* multipart image parsers or Cloudinary uploads execute, preventing upload bandwidth exhaustion and storage flooding.
- **Dual-Factor Identity Throttling**: Critical auth endpoints (registration OTPs, password reset) enforce limits concurrently across client IP and normalized email addresses, preventing email abuse and brute-force credential stuffing.
- **Cookie-Only WebSocket Handshake**: WebSocket connections are authenticated strictly via the browser's HTTP `Cookie` header during the initial upgrade handshake. Access tokens are **never** exposed in WebSocket query parameters or URLs.
- **Zero-Token URL Leaks**: Sensitive credentials, passwords, and tokens never touch URL query strings or browser history.
- **Robust Reconnection Management**: Sockets closed intentionally (e.g. user logout, provider cleanup) are flagged using memory-safe `WeakSet` registries to prevent background reconnection loops.
- **Pure State Updates**: Real-time event dispatches decouple side-effects from React state updaters, preventing redundant network requests and ensuring strict React 19 compliance.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE). Built for students, by students.
