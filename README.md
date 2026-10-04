# Game-Ansh Monorepo

Production-oriented monorepo for the Gamers'G gaming platform.

## Repository Structure

```
Game-Ansh/
├── backend/                     # Backend API (Express.js, PostgreSQL, Redis, Socket.io)
├── frontend/                    # Frontend client application
├── database/                    # Database migrations, seeds, and migration scripts
│   ├── migrations/              # SQL migration files
│   ├── scripts/                 # Database runner scripts (e.g. migrate.js)
│   └── seeds/                   # Seed data
├── infrastructure/              # Deployment and operations configs
│   ├── docker/                  # Dockerfiles and container configs
│   ├── environments/            # Env-specific configs (dev/staging/prod)
│   ├── monitoring/              # Prometheus & Grafana configs
│   ├── nginx/                   # Reverse proxy configs
│   └── scripts/                 # DevOps helper scripts
├── docs/                        # Architecture, API, database, and deployment docs
├── tests/                       # Cross-application e2e and integration tests
├── .github/                     # CI/CD workflows
├── docker-compose.yml           # Local service orchestration (Postgres, Redis)
├── .env.example                 # Root environment variables template
└── .gitignore                   # Monorepo gitignore rules
```

## Quick Start

### 1. Start Infrastructure Dependencies
```bash
docker-compose up -d
```

### 2. Run Database Migrations
```bash
node database/scripts/migrate.js
```

### 3. Backend Setup
```bash
cd backend
npm install
npm run dev
```

# before making frontend please read the api docs for frontend in the docs folder path: "docs/api/frontend"
