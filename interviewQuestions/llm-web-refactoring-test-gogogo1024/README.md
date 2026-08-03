# Chirp - Social Media Platform

A Twitter-like social media platform built as a monorepo with TanStack Start, React 19, gRPC, StyleX, and SQLite.

> NOTE: Task details are documented in TASK.md

## Architecture

Chirp is a full-stack monorepo application with:

- **User App** (`apps/client-user`) - Consumer-facing social media application
- **Admin App** (`apps/client-admin`) - Administrative dashboard for content moderation
- **API Server** (`apps/api`) - gRPC-based backend service

## Quick Start

```bash
# Install dependencies
pnpm install

# Generate protocol buffers
pnpm run proto:generate

# Setup database
pnpm run db:generate
pnpm run db:migrate
pnpm run db:seed

# Start all services (API + User App + Admin App)
pnpm run dev
```

### Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| User App | http://localhost:3000 | Main social media interface |
| Admin App | http://localhost:3002 | Admin dashboard |
| API Server | http://localhost:3001 | gRPC API (health check at /health) |

## Test Accounts

After running the seed script:

### Regular Users
- alice@test.com / password123
- bob@test.com / password123
- charlie@test.com / password123
- diana@test.com / password123
- eve@test.com / password123

### Admin User
- admin@chirp.com / admin123

## Features

### User Application

#### Core Features
- **Authentication** - Email/password registration, login, session management
- **Posts (Chirps)** - Create, edit (within 5 min), delete text posts (max 280 chars)
- **Comments** - Add/delete comments, nested threads (1 level deep)
- **Likes** - Like/unlike posts and comments
- **User Profiles** - View profiles, edit own profile (name, bio, avatar)
- **Follow System** - Follow/unfollow users, follower/following counts

#### Feed & Discovery
- **Home Feed** - Posts from followed users
- **Explore Feed** - All recent posts
- **Search** - Find posts by content, users by name/username

#### Engagement Features
- **Bookmarks** - Save posts for later, dedicated bookmarks page
- **Notifications** - Alerts for likes, comments, follows, and mentions
- **Mentions** - @username linking in posts and comments

### Admin Application

- **Dashboard** - Platform statistics and overview
- **User Management** - View, search, suspend/unsuspend users
- **Post Management** - Moderate and delete posts
- **Comment Management** - Moderate and delete comments
- **Reports** - Handle user reports on content
- **Audit Logs** - Track all administrative actions

## Project Structure

```
chirp/
├── apps/
│   ├── api/                    # gRPC API server
│   │   ├── src/
│   │   │   ├── grpc/           # gRPC handlers and server
│   │   │   ├── services/       # Business logic services
│   │   │   └── db/             # Database connection and seed
│   │   └── package.json
│   │
│   ├── client-user/            # User-facing TanStack Start app
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   ├── routes/         # File-based routing
│   │   │   ├── server/         # Server functions
│   │   │   └── tokens.stylex.ts # Design tokens
│   │   ├── tests/
│   │   │   ├── unit/           # Vitest unit tests
│   │   │   └── e2e/            # Playwright E2E tests
│   │   └── package.json
│   │
│   └── client-admin/           # Admin TanStack Start app
│       ├── src/
│       │   ├── components/     # Admin UI components
│       │   ├── routes/         # Admin routes
│       │   └── server/         # Admin server functions
│       ├── tests/
│       │   ├── unit/           # Vitest unit tests
│       │   └── e2e/            # Playwright E2E tests
│       └── package.json
│
├── packages/
│   ├── db-schema/              # Drizzle ORM schema definitions
│   ├── proto/                  # Protocol buffer definitions
│   ├── grpc-client/            # gRPC client library
│   ├── ui/                     # Shared UI components (StyleX)
│   └── shared-types/           # Shared TypeScript types
│
├── db/
│   └── migrations/             # Database migrations
│
├── tooling/
│   └── typescript/             # Shared TypeScript config
│
└── package.json                # Root monorepo config
```

## Available Scripts

### Root Level (Turborepo)

```bash
pnpm run dev              # Start all services
pnpm run dev:user         # Start only user app
pnpm run dev:admin        # Start only admin app
pnpm run dev:api          # Start only API server

pnpm run build            # Build all packages
pnpm run typecheck        # Type check all packages
pnpm run lint             # Lint all packages
pnpm run lint:fix         # Fix linting issues

pnpm run test             # Run all tests
pnpm run test:unit        # Run unit tests
pnpm run test:e2e         # Run E2E tests

pnpm run db:generate      # Generate database migrations
pnpm run db:migrate       # Run database migrations
pnpm run db:seed          # Seed database with test data

pnpm run proto:generate   # Generate TypeScript from proto files
pnpm run clean            # Clean all build artifacts
```

### Per-App Scripts

Each app (`apps/client-user`, `apps/client-admin`, `apps/api`) has:

```bash
pnpm run dev              # Start development server
pnpm run build            # Build for production
pnpm run typecheck        # Type check
pnpm run test             # Run tests
pnpm run test:unit        # Run unit tests only
pnpm run test:e2e         # Run E2E tests only (client apps)
```

## Tech Stack

| Category | Technology |
|----------|------------|
| **Monorepo** | Turborepo + pnpm workspaces |
| **Framework** | TanStack Start (React 19) |
| **Language** | TypeScript (strict mode) |
| **Styling** | StyleX |
| **API** | gRPC with Protocol Buffers |
| **Database** | SQLite with Drizzle ORM |
| **Linting** | Biome |
| **Testing** | Vitest (unit) + Playwright (E2E) |
| **Package Manager** | pnpm |

## Database Schema

### Core Tables
- `users` - User accounts and profiles
- `posts` - User posts/chirps
- `comments` - Post comments
- `likes` - Post and comment likes
- `follows` - User follow relationships

### Feature Tables
- `bookmarks` - Saved posts
- `notifications` - User notifications
- `reports` - Content reports
- `audit_logs` - Admin action logs

## Development

### Adding a New Feature

1. **Database**: Add schema in `packages/db-schema/src/schema.ts`
2. **Proto**: Define gRPC service in `packages/proto/protos/`
3. **API**: Implement service in `apps/api/src/services/`
4. **Handler**: Add gRPC handler in `apps/api/src/grpc/handlers/`
5. **Client**: Update `packages/grpc-client/src/client.ts`
6. **Server Functions**: Add in `apps/client-*/src/server/functions/`
7. **Components**: Create UI in `apps/client-*/src/components/`
8. **Routes**: Add pages in `apps/client-*/src/routes/`
9. **Tests**: Add unit tests and E2E tests

### Running Tests

```bash
# Run all tests
pnpm run test

# Run specific app tests
cd apps/client-user && pnpm run test:e2e

# Run with UI mode
cd apps/client-user && pnpm exec playwright test --ui
```

### Reset Environment

```bash
# Clean everything and start fresh
pnpm run clean
rm -f chirp.db chirp.db-shm chirp.db-wal
pnpm install
pnpm run proto:generate
pnpm run db:generate
pnpm run db:migrate
pnpm run db:seed
```

## API Services

The API uses gRPC with the following services:

- `AuthService` - Authentication (login, register, validate session)
- `UsersService` - User management and profiles
- `PostsService` - Post CRUD operations
- `CommentsService` - Comment operations
- `LikesService` - Like/unlike functionality
- `FollowsService` - Follow/unfollow users
- `BookmarksService` - Bookmark management
- `NotificationsService` - Notification handling
- `SearchService` - Search posts and users
- `AdminService` - Admin-only operations

Proto definitions are in `packages/proto/protos/`.
