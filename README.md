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
[![BullMQ](https://img.shields.io/badge/BullMQ-000000?style=for-the-badge&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA4klEQVR42u2VPQrCMBhAK0JBT6Dg5Al6Bc/QxVFw0Rs4isdxcXdxcPEuDk7OrwRaCCVf/hpdmgehTZrwvSRf0qLIZDKjB0hdpsDXt3/q4GjPjs2/BSR+KvDqBfIWMc3gPWDGV9yIAgvt/Wxbtvbbk3iMAjiSSj0fEcHmNgnXEtfAAZgxjFOsgE9S4ZGAW6l/F+gobEEZsbe+UrhWQLGLWO4K+Gj1WkhAUcBkLc3iIhzJFTAxjHdeRLfQY2Ror7T6PeRfYLsyJYF1r610Xb2SgO8gQgOkFlBl3/ZdJhHIZDKjpwEChssBAVjiBQAAAABJRU5ErkJggg==)](https://bullmq.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![WebSockets](https://img.shields.io/badge/WebSockets-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
[![Resend](https://img.shields.io/badge/Resend-000000?style=for-the-badge&logo=resend&logoColor=white)](https://resend.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

</div>


## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Email Background Job Architecture](#-email-background-job-architecture)
  - [Workflow](#workflow)
  - [Reliability & Resilience Features](#reliability--resilience-features)
  - [Component Responsibilities](#component-responsibilities)
  - [Delivery Semantics](#delivery-semantics)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
  - [3. Running the Email Worker](#3-running-the-email-worker)
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
- **OTP Verification**: Email verification via 4-digit numeric OTP sent via Resend transactional email API with domain verification (`selloncampus.site`).
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
- **Dual-Layer Auth Protection**: Correlated IP and email-based limiting on OTP requests and password resets to prevent email quota exhaustion and brute-force attacks.
- **Quota & Resource Guards**: Per-user limits on listing creation (10 listings/hour, protecting image upload pipelines) and instant messaging (30 messages/minute).
- **RFC Standard Headers**: Automatically provides `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and standard `Retry-After` on `429 Too Many Requests`.

### 📬 Asynchronous Email Delivery & Transactional Outbox
- **Transactional Outbox Pattern**: Delivery intent for welcome emails is recorded in PostgreSQL within the same atomic transaction as account creation, preventing lost emails.
- **Decoupled Asynchronous Processing**: Email sending is completely removed from the user registration HTTP request-response cycle and handled by BullMQ in a dedicated worker process.
- **Exponential Backoff & Retries**: Automated 4-attempt retry sequence with exponential delay (2s, 4s, 8s, 16s) to gracefully absorb third-party email provider outages.
- **Provider-Level Idempotency**: Deduplicated outbound requests using deterministic Resend idempotency keys, mitigating duplicate sends across process restarts.

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

    subgraph Backend ["Backend API Server (Express 5 + TypeScript)"]
        HTTP["Express HTTP Endpoints"]
        RateLimit["Rate Limiter (Redis Lua Scripts)"]
        AuthMiddleware["JWT Cookie Handshake & Verification"]
        Services["Business Services (Listings, Auth, Chat)"]
        CacheLayer["Redis Cache-Aside (node-redis)"]
        WSServer["WebSocket Server ('ws')"]
        OutboxDispatcher["Email Outbox Dispatcher (Polls every 5s)"]
    end

    subgraph DataStore ["Data & Queue Storage"]
        NeonDB[("PostgreSQL / Neon (App Data & EmailOutbox)")]
        RedisDB[("Redis Store (Caching, Rate Limiting & BullMQ Queue)")]
        Cloudinary["Cloudinary CDN (Listing Images)"]
    end

    subgraph WorkerProcess ["Background Worker Process"]
        EmailWorker["BullMQ Worker (email.worker.ts)"]
        EmailService["Resend API (Transactional Delivery)"]
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
    CacheLayer <-->|"node-redis connection"| RedisDB
    Services <-->|"Prisma ORM"| NeonDB
    HTTP --> Cloudinary
    WSServer --> NeonDB

    OutboxDispatcher -->|"1. Poll pending records"| NeonDB
    OutboxDispatcher -->|"2. Enqueue jobs (ioredis connection)"| RedisDB
    OutboxDispatcher -->|"3. Mark DISPATCHED"| NeonDB

    RedisDB -->|"4. Consume jobs"| EmailWorker
    EmailWorker -->|"5. Fetch outbox payload"| NeonDB
    EmailWorker -->|"6. Send with Idempotency Key"| EmailService
    EmailWorker -->|"7. Mark SENT & update welcomeEmailSentAt"| NeonDB
```

---

## 📬 Email Background Job Architecture

Welcome email delivery employs a **Transactional Outbox Pattern** combined with a **BullMQ** queue and a standalone worker process. This architecture completely decouples student registration from external email API latency and guarantees that email delivery intent survives server restarts and transient network failures.

### Workflow

1. **Student Registration Submission**: The user submits registration details (`name`, `email`, `password`) to `POST /api/v1/auth/register`.
2. **Atomic Database Transaction**: Inside a single Prisma transaction (`prisma.$transaction`), the backend atomically:
   - Creates the `User` record (with `emailVerifiedAt`).
   - Deletes the verified OTP record from `Verification` so it cannot be reused.
   - Inserts an `EmailOutbox` record with `type: "WELCOME_EMAIL"`, `status: "PENDING"`, and payload containing recipient data.
3. **Immediate HTTP Response**: The user receives an immediate `201 Created` response along with authentication cookies without waiting for email delivery.
4. **Outbox Polling & Dispatch**: The background outbox dispatcher (`email-outbox.dispatcher.ts`) running inside the API server polls PostgreSQL on a 5-second interval for records with `status: "PENDING"`.
5. **Queue Ingestion**: The dispatcher pushes a job to BullMQ's `email-queue` using a deterministic job ID (`email-outbox-${outbox.id}`) and marks the outbox record as `status: "DISPATCHED"` with `dispatchedAt = now()`.
6. **Worker Processing**: The standalone BullMQ worker (`email.worker.ts`) consumes the job from `email-queue`.
7. **Email Dispatch via Resend**: The worker retrieves the outbox payload and invokes the existing `sendWelcomeEmail()` service, passing a deterministic idempotency key (`welcome-email-${outbox.id}`) to Resend.
8. **Final State Update**: Upon successful API acceptance from Resend, the worker runs an atomic database update that marks `EmailOutbox.status = "SENT"`, records `sentAt = now()`, and sets the user's `welcomeEmailSentAt` timestamp.

```mermaid
flowchart TD
    subgraph Client ["Client / Browser"]
        RegistrationRequest["1. POST /api/v1/auth/register"]
    end

    subgraph API ["Express API Server"]
        AuthController["auth.controller.ts: register()"]
        Tx["2. prisma.$transaction"]
        CreateUser["Create User (emailVerifiedAt)"]
        DeleteOTP["Delete Verification OTP"]
        CreateOutbox["Create EmailOutbox (status: PENDING)"]
        HTTPResponse["3. Return HTTP 201 Created"]
        Dispatcher["4. email-outbox.dispatcher.ts (Polls every 5s)"]
    end

    subgraph Storage ["Persistent Storage"]
        Postgres[("PostgreSQL Database (Neon)")]
        RedisQueue[("Redis Queue ('email-queue')")]
    end

    subgraph BackgroundWorker ["Background Worker Process"]
        Worker["6. email.worker.ts (Concurrency: 5)"]
        ResendAPI["7. Resend Email API"]
    end

    RegistrationRequest --> AuthController
    AuthController --> Tx
    Tx --> CreateUser
    Tx --> DeleteOTP
    Tx --> CreateOutbox
    CreateUser --> Postgres
    DeleteOTP --> Postgres
    CreateOutbox --> Postgres
    Tx --> HTTPResponse
    Dispatcher -->|"Poll status = PENDING"| Postgres
    Dispatcher -->|"5. Add Job (jobId: email-outbox-id)"| RedisQueue
    Dispatcher -->|"Mark status = DISPATCHED"| Postgres
    RedisQueue -->|"Consume Job"| Worker
    Worker -->|"Fetch Outbox payload"| Postgres
    Worker -->|"Send with Idempotency Key"| ResendAPI
    ResendAPI -->|"HTTP 200 OK"| Worker
    Worker -->|"8. Mark status = SENT & update welcomeEmailSentAt"| Postgres
```

### Reliability & Resilience Features

- **Transactional Persistence**: Account creation and the outbox record share the same PostgreSQL transaction boundary. If user registration fails, no outbox record is created; if the server crashes after registration, the outbox record remains durable in PostgreSQL.
- **Periodic Outbox Polling**: The dispatcher queries up to 20 pending records (`BATCH_SIZE = 20`) ordered chronologically (`createdAt: asc`). A process-level lock flag (`isDispatching`) prevents overlapping execution cycles if a batch takes longer than 5 seconds.
- **Deterministic Job Deduplication**: Every BullMQ job is assigned a deterministic ID: `email-outbox-${email.id}`. If the dispatcher evaluates the same record twice before the status write finishes, BullMQ prevents duplicate active or waiting jobs in Redis.
- **Exponential Backoff Retries**: Queue defaults specify `attempts: 4` with an exponential backoff starting at 2,000ms (`delay: 2000`). If Resend experiences temporary rate limiting or a 5xx error, BullMQ retries at 2s, 4s, 8s, and 16s intervals.
- **Worker Concurrency**: The worker operates with `concurrency: 5`, allowing up to 5 email jobs to be processed concurrently per worker process without blocking the event loop.
- **Job Retention & Cleanup**: Completed jobs are kept in Redis for 1 hour or up to 1,000 jobs (`removeOnComplete: { age: 3600, count: 1000 }`), while failed jobs are retained for 7 days or up to 5,000 jobs (`removeOnFail: { age: 7 * 24 * 3600, count: 5000 }`) for monitoring and inspection.
- **Resend Idempotency Keys**: The worker supplies `idempotencyKey: welcome-email-${outbox.id}` to `resend.emails.send()`. If a worker crashes after Resend accepts an email but before updating PostgreSQL, a subsequent retry will send the same idempotency key. Resend will recognize the key and replay the original response without sending a second email.
- **Outbox Status Lifecycle**: The `EmailOutbox` table tracks the end-to-end lifecycle across four distinct states:
  - `PENDING`: Persisted in PostgreSQL, waiting for dispatcher discovery.
  - `DISPATCHED`: Pushed to BullMQ with `dispatchedAt` timestamp recorded.
  - `SENT`: Accepted by Resend API with `sentAt` recorded, `attempts` incremented, and `lastError` cleared.
  - `FAILED`: Retries exhausted; updated by the worker's `failed` event listener with `lastError` capturing the error message.
- **Failure Tracking**: When a job exhausts all configured attempts (`job.attemptsMade >= job.opts.attempts`), the worker automatically transitions the outbox record to `status: "FAILED"`, records the final attempt count, and logs `lastError: error.message`.
- **Graceful Shutdown Handling**:
  - The API server handles `SIGTERM` and `SIGINT` by stopping the dispatcher interval, stopping new HTTP connections, closing the BullMQ queue, closing both Redis clients, and disconnecting Prisma.
  - The worker process handles `SIGTERM` and `SIGINT` by calling `emailWorker.close()` (allowing active jobs to finish processing while rejecting new jobs), disconnecting Prisma, and closing the `ioredis` connection.

### Component Responsibilities

| Component | Responsibility |
| :--- | :--- |
| **PostgreSQL (Neon)** | Durable storage of application data and `EmailOutbox` records. Serves as the persistent source of truth for email delivery intent and status. |
| **Prisma ORM** | Type-safe database client executing atomic multi-table operations (`prisma.$transaction`) and status updates. |
| **Outbox Dispatcher** | Background service within the API server that polls PostgreSQL for `PENDING` records, pushes them to BullMQ, and updates their status to `DISPATCHED`. |
| **BullMQ** | Task queue engine managing job scheduling, concurrency, backoff timing, retries, and job lifecycle state. |
| **Redis** | High-performance in-memory datastore acting as BullMQ's queue broker and backing the existing caching and rate-limiting infrastructure. |
| **Email Worker** | Standalone consumer process that executes email sending outside the HTTP request-response cycle and performs database status transitions. |
| **Resend** | Transactional email delivery service responsible for email template delivery, MIME attachments, and SMTP relay. |

### Delivery Semantics

The transactional outbox pattern guarantees **durable persistence of email delivery intent** and provides **at-least-once execution** through BullMQ. It does **not** guarantee inbox delivery, which remains subject to external mail transfer agents (VIT Microsoft 365 Exchange Online), network routing, and recipient spam filtering. While Resend idempotency keys protect against duplicate delivery during worker crashes, transient network partitions and failure topologies operate under at-least-once delivery guarantees.

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
| **Prisma ORM 7** | Type-safe database queries, schema migrations, and atomic transactions |
| **PostgreSQL (Neon)** | Cloud serverless relational database storing application entities and the transactional `EmailOutbox` |
| **BullMQ** | Distributed background job processing and task queue management with automatic retries and exponential backoff |
| **ioredis** | High-performance Redis client providing a dedicated connection for BullMQ with `maxRetriesPerRequest: null` |
| **Redis (`node-redis`)** | Official Redis client powering cache-aside caching (`listing:{id}`, categories) and atomic Lua rate limiting |
| **Transactional Outbox Pattern** | Architectural pattern ensuring durable database persistence of email tasks before queue dispatch |
| **`ws` Library** | Native WebSockets with heartbeat detection and client connection manager |
| **Resend** | Transactional email delivery via Resend API with inline CID attachments and idempotency keys |
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
- A [Resend](https://resend.com/) account and API key for transactional emails

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

   # Resend Email Service (https://resend.com)
   RESEND_API_KEY=re_your_api_key_here
   # Optional custom sender address override
   # SMTP_FROM="SellOnCampus <noreply@selloncampus.site>"

   # Development Bypass / Whitelisted Test Email
   DEV_TEST_EMAIL=your_email@gmail.com

   # Cloudinary Media Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   NODE_ENV=development
   ```

4. Push the Prisma schema or run migrations on your database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will boot on `http://localhost:5000` with WebSocket support and starts the Email Outbox Dispatcher.*

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

### 3. Running the Email Worker

The BullMQ email worker runs as an **independent process** alongside the API server. Both processes share access to the same PostgreSQL database and Redis instance.

#### In Development
In a dedicated terminal, run:
```bash
cd backend
npm run dev:worker
```
*This executes `tsx src/workers/email.worker.ts`, connecting to Redis and listening for jobs on `email-queue` with automatic TypeScript compilation.*

#### Building the Backend
To build both the API server and worker for production:
```bash
cd backend
npm run build
```
*This runs `prisma generate && tsc`, compiling TypeScript from `src/` to `dist/`, including `dist/server.js` and `dist/workers/email.worker.js`.*

#### In Production
- **Start the API Server**:
  ```bash
  cd backend
  npm run start
  ```
  *(Executes `node dist/server.js`)*

- **Start the Email Worker**:
  A dedicated npm script is not defined in `package.json` for production workers. In production environments (e.g. a Render Background Worker), execute the compiled worker entry point directly:
  ```bash
  cd backend
  node dist/workers/email.worker.js
  ```

---

## 📁 Directory Structure

```text
SellOnCampus/
├── backend/
│   ├── prisma/
│   │   ├── migrations/          # Versioned SQL migrations (includes add_email_outbox)
│   │   └── schema/              # Modular Prisma schema models (user, emailOutbox, etc.)
│   ├── src/
│   │   ├── controllers/         # Express endpoint controllers (auth, listings, chat, reports)
│   │   ├── lib/
│   │   │   ├── auth/            # Cookie helpers, token issuance (jose), and OTP crypto
│   │   │   ├── cache/           # Redis client (node-redis) & cache-aside helper
│   │   │   ├── queue/           # BullMQ queue definition & dedicated ioredis connection
│   │   │   ├── validation/      # Email domain verification
│   │   │   └── prisma.ts        # PrismaClient instance with PostgreSQL adapter
│   │   ├── middleware/          # Auth guards, rate limiting engine, uploads, and Zod validation
│   │   ├── routes/              # Express API route modules
│   │   ├── services/            # Business logic layer (email, listings, chat, reports)
│   │   │   └── email/           # Email service, templates, and CID logo asset
│   │   ├── types/               # TypeScript global declarations
│   │   ├── utils/               # Rate limit presets & helper utilities
│   │   ├── validators/          # Zod validation schemas
│   │   ├── websocket/           # WebSocket server, auth, and connection manager
│   │   ├── workers/
│   │   │   ├── email-outbox.dispatcher.ts # Periodic outbox poller and BullMQ dispatcher
│   │   │   └── email.worker.ts            # BullMQ email worker process with graceful shutdown
│   │   ├── app.ts               # Express configuration & CORS
│   │   └── server.ts            # HTTP, WebSocket & Dispatcher initialization
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

- **Transactional Outbox Decoupling**: User registration, OTP deletion, and email delivery intent are bound into an atomic PostgreSQL transaction. Email sending is removed from the HTTP request path, protecting registration response times from Resend API latency.
- **Dedicated Dual Redis Connections**: Uses the official `redis` package (`node-redis`) for application caching and atomic Lua rate limiting, while utilizing a dedicated `ioredis` client with `maxRetriesPerRequest: null` for BullMQ queue operations to prevent blocking-command conflicts.
- **Provider-Level Idempotency**: Worker dispatches include deterministic idempotency keys (`welcome-email-${outbox.id}`), eliminating duplicate emails if a worker crashes before completing database status updates.
- **Cache-Aside Architecture & TTLs**: Read-heavy marketplace endpoints (`listing:{id}`, category hierarchies, paginated query caches) leverage Redis cache-aside with granular TTLs, shielding PostgreSQL from repeat read spikes and providing sub-millisecond responses.
- **Atomic Cache Consistency & Targeted Eviction**: Listing edits, deletions, and status toggles (`Active` -> `Reserved` -> `Sold`) trigger immediate atomic cache invalidation (`deleteCache`), eliminating split-brain states across campus buyers and sellers.
- **Atomic Redis Rate Limiting**: Distributed abuse mitigation powered by Redis and atomic Lua scripting (`INCR` + `EXPIRE` on first touch), guaranteeing race-condition-free quota enforcement without distributed locking overhead.
- **Fail-Open Fault Tolerance**: If the Redis instance temporarily disconnects or errors, the rate limiter logs the exception and gracefully permits requests to flow rather than causing system-wide outages.
- **Pre-Upload Quota Enforcements**: Authenticated endpoints like listing creation enforce rate limits *before* multipart image parsers or Cloudinary uploads execute, preventing upload bandwidth exhaustion and storage flooding.
- **Dual-Factor Identity Throttling**: Critical auth endpoints (registration OTPs, password reset) enforce limits concurrently across client IP and normalized email addresses, preventing email abuse and brute-force credential stuffing.
- **Cookie-Only WebSocket Handshake**: WebSocket connections are authenticated strictly via the browser's HTTP `Cookie` header during the initial upgrade handshake. Access tokens are **never** exposed in WebSocket query parameters or URLs.
- **Zero-Token URL Leaks**: Sensitive credentials, passwords, and tokens never touch URL query strings or browser history.
- **Graceful Multi-Process Shutdown**: Both the API server and the standalone email worker capture `SIGTERM` and `SIGINT` to cleanly close queue listeners, wait for active jobs to finish processing, and disconnect database and Redis connections.
- **Robust Reconnection Management**: Sockets closed intentionally (e.g. user logout, provider cleanup) are flagged using memory-safe `WeakSet` registries to prevent background reconnection loops.
- **Pure State Updates**: Real-time event dispatches decouple side-effects from React state updaters, preventing redundant network requests and ensuring strict React 19 compliance.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Built for students, by students.
