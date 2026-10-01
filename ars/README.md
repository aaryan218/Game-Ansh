# Gamers'G — Backend API

Express.js + TypeScript + PostgreSQL + Redis + Socket.io backend for the Gamers'G gaming platform.

## Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js 20 + TypeScript 5 |
| Framework | Express.js 4 |
| Database | PostgreSQL (node-postgres) |
| Cache / PubSub | Redis (ioredis) |
| Real-time | Socket.io 4 + `@socket.io/redis-adapter` |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Validation | Zod |
| Rate limiting | express-rate-limit + rate-limit-redis |

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Fill in DATABASE_URL, REDIS_URL, JWT_SECRET

# 3. Run migrations
npm run migrate

# 4. Start dev server
npm run dev
```

## Account Types

| Type | JWT `role` | Notes |
|---|---|---|
| Player | `player` | Individual gamer — joins teams |
| Org | `org` | Owns teams, rosters players directly |
| Tournament Organizer | `organizer` | Creates and manages tournaments |
| Admin | `admin` | Internal — verifies orgs and organizers |

## API Endpoints

### Auth
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/signup/player` | — | Player signup |
| POST | `/auth/signup/org` | — | Org signup |
| POST | `/auth/signup/organizer` | — | Tournament organizer signup |
| POST | `/auth/login` | — | Login (all types), returns JWT |

### Players
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/players/:id` | — | Get player profile |
| PUT | `/players/:id` | player | Update own profile |

### Orgs
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/orgs/:id` | — | Get org profile |
| PUT | `/orgs/:id` | org | Update own org |
| GET | `/orgs/:id/teams` | — | List org's teams |
| GET | `/orgs/:id/players` | — | List org's direct players |

### Teams
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/teams` | org | Create draft team |
| GET | `/teams/:id` | — | Get team + roster |
| PUT | `/teams/:id` | org | Update team |
| POST | `/teams/:id/players` | org | Add player to team |
| DELETE | `/teams/:id/players/:playerId` | org | Remove player |

### Recruitment
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/teams/:teamId/postings` | org | Create role posting |
| GET | `/teams/:teamId/postings` | — | List team's postings |
| PATCH | `/postings/:postingId/close` | org | Close a posting |
| POST | `/postings/:postingId/apply` | player | Apply to posting |
| GET | `/applications/:id` | player/org | Get application |
| PATCH | `/applications/:id` | org | Advance application status |

### Discovery
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/discovery/teams` | — | Search teams (cursor-paginated) |
| GET | `/discovery/tournaments` | — | Search tournaments (cursor-paginated) |

Query params: `name`, `game`, `status`, `limit`, `cursor`

### Social
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/follow` | player | Follow org or team |
| DELETE | `/follow` | player | Unfollow |
| GET | `/feed` | player | Paginated feed from followed entities |
| POST | `/posts` | org | Create post |
| GET | `/posts/:id` | — | Get single post |

### Messaging
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/messages/:threadId` | player | Get thread history |
| POST | `/messages/:threadId` | player | Send message |

`threadId` = `<id1>:<id2>` where ids are sorted alphabetically (smaller first).

### Tournaments
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/tournaments` | organizer | Create tournament |
| GET | `/tournaments/:id` | — | Get tournament |
| PATCH | `/tournaments/:id` | organizer | Update tournament |
| POST | `/tournaments/:id/register` | org | Register team |
| GET | `/tournaments/:id/registrations` | organizer | List registrations |
| PATCH | `/tournaments/:id/registrations/:regId` | organizer | Approve/reject registration |

### Admin
| Method | Path | Auth | Purpose |
|---|---|---|---|
| PATCH | `/admin/orgs/:id/verify` | admin | Verify org |
| PATCH | `/admin/organizers/:id/verify` | admin | Verify tournament organizer |
| GET | `/admin/users` | admin | List all users |

## Business Rules

- **Player exclusivity**: A player can be on a team OR directly under an org — never both. Enforced at DB level via `CHECK (team_id IS NULL OR org_id IS NULL)`.
- **Team activation**: Draft team auto-flips to `active` when the 5th player joins. Done atomically in a transaction.
- **Application state machine**: `applied → shortlisted → accepted | rejected`. Skipping (applied → accepted) or reversing any transition returns 400.
- **Rate limiting**: Write endpoints — 30 req / 15 min. Tournament and posting creation — 10 req / hour. Both Redis-backed.

## Real-time Events (Socket.io)

Connect with `{ auth: { userId: "<your-id>" } }`. Clients auto-join room `user:<userId>`.

| Event | Recipient | Trigger |
|---|---|---|
| `new_message` | receiver player | Someone sends them a message |
| `application_status_changed` | applicant player | Org advances their application |
| `new_post` | each follower | Org creates a post |

## Module Layout

```
src/
  modules/
    auth/          signup + login (3 account types)
    players/       player profile CRUD
    orgs/          org profile, teams/players lists
    teams/         team CRUD + player management
    recruitment/   role postings + application lifecycle
    discovery/     cursor-paginated search
    social/        follows + feed + posts
    messaging/     1:1 chat
    tournaments/   tournament + registration management
    admin/         verification panel
  shared/
    auth/          JWT helpers + auth middleware
    db/            pg pool + migration runner
    redis/         ioredis client
    socket/        Socket.io server + emitter
    ratelimit/     write + strict rate limiters
    pagination/    cursor pagination helpers
    validation/    Zod middleware
    errors/        AppError hierarchy + global handler
```

## Tests

```bash
npm test
```

## Type Check

```bash
npm run typecheck
```
