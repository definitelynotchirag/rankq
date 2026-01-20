# RankQ Backend Architecture

## Overview

RankQ is a real-time leaderboard system built with Go following Clean Architecture principles. It uses Redis Sorted Sets for instant ranking operations and PostgreSQL for durable storage and search.

## Project Structure

```
backend/
├── cmd/
│   ├── api/           # Main application entry point
│   └── seed/          # Database seeding utility
├── internal/
│   ├── domain/        # Business entities and repository interfaces
│   │   ├── entity/    # Core business objects
│   │   └── repository/# Interface definitions
│   ├── application/   # Business logic (services/use cases)
│   │   └── service/
│   ├── infrastructure/# External implementations
│   │   ├── database/  # PostgreSQL repositories
│   │   └── cache/     # Redis repositories
│   └── interface/     # Delivery mechanisms
│       └── http/
│           ├── handler/   # HTTP handlers
│           ├── middleware/# HTTP middleware
│           └── router/    # Route definitions
├── pkg/
│   └── config/        # Configuration management
├── migrations/        # SQL migration files
├── docker-compose.yml # Local development setup
└── Makefile          # Build and run commands
```

## Clean Architecture Layers

### 1. Domain Layer (`internal/domain/`)

The innermost layer containing business entities and repository interfaces. Has no external dependencies.

**Entities:**
- `User`: Core user data (id, username, created_at)
- `UserScore`: User rating data (user_id, rating, updated_at)
- `LeaderboardEntry`: Denormalized view for API responses
- `SearchResult`: Search result with rank information

**Repository Interfaces:**
- `UserRepository`: User CRUD and search operations
- `ScoreRepository`: Score persistence operations
- `LeaderboardRepository`: Real-time ranking operations

### 2. Application Layer (`internal/application/`)

Contains business logic that orchestrates domain entities and repositories.

**Services:**
- `UserService`: User creation with initial rating
- `LeaderboardService`: Leaderboard queries, search, rank calculation
- `SimulationService`: Background score update simulation

### 3. Infrastructure Layer (`internal/infrastructure/`)

Implements repository interfaces with concrete technologies.

**PostgreSQL (`database/`):**
- Stores users and scores durably
- Provides trigram-based username search
- Acts as recovery source for Redis

**Redis (`cache/`):**
- Stores leaderboard as Sorted Set
- Provides O(log N) rank calculations
- Handles real-time score updates

### 4. Interface Layer (`internal/interface/`)

HTTP handlers that translate between HTTP and application services.

**Handlers:**
- `UserHandler`: User creation and listing
- `LeaderboardHandler`: Leaderboard, search, rank queries
- `SimulationHandler`: Simulation control

## Data Flow

### Score Update Flow
```
HTTP Request → Handler → LeaderboardService → LeaderboardRepo (Redis)
                                           → ScoreRepo (Postgres)
```

### Leaderboard Fetch Flow
```
HTTP Request → Handler → LeaderboardService → LeaderboardRepo (Redis: get ranked IDs)
                                           → UserRepo (Postgres: get usernames)
                                           → LeaderboardRepo (Redis: calculate ranks)
```

### Search Flow
```
HTTP Request → Handler → LeaderboardService → UserRepo (Postgres: search users)
                                           → LeaderboardRepo (Redis: get ratings)
                                           → LeaderboardRepo (Redis: calculate ranks)
```

## Ranking Logic

Rank is calculated using Redis ZCOUNT:
```
rank = 1 + ZCOUNT(leaderboard:global, (rating+1), +inf)
```

This provides:
- Tie-aware ranking (users with same rating share rank)
- O(log N) complexity
- No precomputed rank storage needed

## API Endpoints

### Users
- `POST /api/v1/users` - Create user with initial rating
- `GET /api/v1/users` - List users (paginated)
- `GET /api/v1/users/:id` - Get user by ID

### Leaderboard
- `GET /api/v1/leaderboard` - Get paginated leaderboard
- `GET /api/v1/leaderboard/search?q=` - Search users by username
- `GET /api/v1/leaderboard/user/:id` - Get user rank
- `PUT /api/v1/leaderboard/user/:id/score` - Update user score
- `POST /api/v1/leaderboard/rebuild` - Rebuild Redis from Postgres

### Simulation
- `POST /api/v1/simulation/start` - Start score simulation
- `POST /api/v1/simulation/stop` - Stop simulation
- `GET /api/v1/simulation/status` - Get simulation status

## Running the Backend

### Prerequisites
- Docker and Docker Compose
- Go 1.22+ (or use the local installation in `backend/go/`)

### Quick Start

1. Start dependencies:
```bash
cd backend
docker-compose up -d
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Run the server:
```bash
make dev
# or
go run cmd/api/main.go
```

4. Seed test data:
```bash
make seed
# or
go run cmd/seed/main.go
```

### Available Make Commands
- `make dev` - Run in development mode
- `make build` - Build binary
- `make run` - Build and run
- `make docker-up` - Start Postgres and Redis
- `make docker-down` - Stop containers
- `make seed` - Seed test users

## Configuration

Environment variables (see `.env.example`):

| Variable | Default | Description |
|----------|---------|-------------|
| SERVER_PORT | 8080 | HTTP server port |
| GIN_MODE | debug | Gin framework mode |
| DB_HOST | localhost | PostgreSQL host |
| DB_PORT | 5432 | PostgreSQL port |
| DB_USER | postgres | PostgreSQL user |
| DB_PASSWORD | postgres | PostgreSQL password |
| DB_NAME | rankq | Database name |
| DB_SSLMODE | disable | SSL mode |
| REDIS_HOST | localhost | Redis host |
| REDIS_PORT | 6379 | Redis port |
| REDIS_PASSWORD | | Redis password |
| REDIS_DB | 0 | Redis database index |

## Failure Recovery

### Redis Failure
If Redis loses data, the leaderboard can be rebuilt from PostgreSQL:
```bash
curl -X POST http://localhost:8080/api/v1/leaderboard/rebuild
```

### PostgreSQL Failure
The leaderboard continues functioning with Redis. Score persistence retries asynchronously when PostgreSQL recovers.

## Performance Characteristics

- Leaderboard fetch: O(page_size * log N) for rank lookups
- Search: O(results * log N) for rank resolution
- Score update: O(log N) for Redis + O(1) for Postgres upsert
- Rank lookup: O(log N)

Where N = total number of users in the leaderboard.
