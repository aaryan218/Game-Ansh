# Gamers'G — Frontend API Documentation

Base URL: `http://localhost:5000` (or configured API gateway / backend server)

### Authentication & Authorization
All protected endpoints require an `Authorization` header containing the JWT bearer token:
```http
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication (`/auth`)

### 1.1 Player Signup
- **Method & Route**: `POST /auth/signup/player`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "player@example.com",
    "password": "SecurePassword123!",
    "username": "shadow_ninja",
    "country": "US",
    "games": ["Valorant", "CS2"]
  }
  ```
- **Response** `(201 Created)`:
  ```json
  {
    "token": "<jwt_token>",
    "user": {
      "id": "uuid",
      "email": "player@example.com",
      "role": "player",
      "profile": { "username": "shadow_ninja", "country": "US", "games": ["Valorant", "CS2"] }
    }
  }
  ```

### 1.2 Organization Signup
- **Method & Route**: `POST /auth/signup/org`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "contact@fnatic.com",
    "password": "SecurePassword123!",
    "name": "Fnatic",
    "website": "https://fnatic.com"
  }
  ```
- **Response** `(201 Created)`:
  ```json
  {
    "token": "<jwt_token>",
    "user": {
      "id": "uuid",
      "email": "contact@fnatic.com",
      "role": "org",
      "profile": { "name": "Fnatic", "website": "https://fnatic.com", "verified": false }
    }
  }
  ```

### 1.3 Tournament Organizer Signup
- **Method & Route**: `POST /auth/signup/organizer`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "events@esl.com",
    "password": "SecurePassword123!",
    "name": "ESL Gaming",
    "description": "Global Esports League Organizer"
  }
  ```
- **Response** `(201 Created)`:
  ```json
  {
    "token": "<jwt_token>",
    "user": {
      "id": "uuid",
      "email": "events@esl.com",
      "role": "organizer",
      "profile": { "name": "ESL Gaming", "description": "Global Esports League Organizer", "verified": false }
    }
  }
  ```

### 1.4 Login (All Account Types)
- **Method & Route**: `POST /auth/login`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response** `(200 OK)`:
  ```json
  {
    "token": "<jwt_token>",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "player" | "org" | "organizer" | "admin",
      "profile": { ... }
    }
  }
  ```

---

## 2. Players (`/players`)

### 2.1 Get Player Profile
- **Method & Route**: `GET /players/:id`
- **Auth Required**: No
- **Response** `(200 OK)`:
  ```json
  {
    "id": "uuid",
    "username": "shadow_ninja",
    "country": "US",
    "games": ["Valorant", "CS2"],
    "bio": "Top fragger",
    "team_id": "uuid | null",
    "org_id": "uuid | null",
    "created_at": "ISOString"
  }
  ```

### 2.2 Update Player Profile
- **Method & Route**: `PUT /players/:id`
- **Auth Required**: Yes (`player`)
- **Request Body**:
  ```json
  {
    "username": "shadow_v2",
    "bio": "Updated bio",
    "country": "US",
    "games": ["Valorant"]
  }
  ```
- **Response** `(200 OK)`: Updated player profile object.

---

## 3. Organizations (`/orgs`)

### 3.1 Get Org Profile
- **Method & Route**: `GET /orgs/:id`
- **Auth Required**: No
- **Response** `(200 OK)`:
  ```json
  {
    "id": "uuid",
    "name": "Sentinels",
    "website": "https://sentinels.gg",
    "verified": true,
    "created_at": "ISOString"
  }
  ```

### 3.2 Update Org Profile
- **Method & Route**: `PUT /orgs/:id`
- **Auth Required**: Yes (`org`, `admin`, `root`)
- **Request Body**:
  ```json
  {
    "name": "Sentinels Esports",
    "website": "https://sentinels.gg"
  }
  ```
- **Response** `(200 OK)`: Updated organization object.

### 3.3 List Org's Teams
- **Method & Route**: `GET /orgs/:id/teams`
- **Auth Required**: Yes (`org`, `admin`, `root`)
- **Response** `(200 OK)`: Array of teams owned by the organization.

### 3.4 List Org's Direct Players
- **Method & Route**: `GET /orgs/:id/players`
- **Auth Required**: Yes (`org`, `admin`, `root`)
- **Response** `(200 OK)`: Array of players directly signed under the org.

---

## 4. Teams (`/teams`)

### 4.1 Create Draft Team
- **Method & Route**: `POST /teams`
- **Auth Required**: Yes (`org`)
- **Request Body**:
  ```json
  {
    "name": "Sentinels Red",
    "game": "Valorant"
  }
  ```
- **Response** `(201 Created)`: Team object with `status: "draft"`.

### 4.2 Get Team Details & Roster
- **Method & Route**: `GET /teams/:id`
- **Auth Required**: No
- **Response** `(200 OK)`:
  ```json
  {
    "id": "uuid",
    "name": "Sentinels Red",
    "game": "Valorant",
    "status": "draft" | "active",
    "org_id": "uuid",
    "players": [
      { "id": "uuid", "username": "TenZ", "role": "Duelist" }
    ]
  }
  ```

### 4.3 Update Team
- **Method & Route**: `PUT /teams/:id`
- **Auth Required**: Yes (`org`)
- **Request Body**:
  ```json
  {
    "name": "Sentinels Main",
    "game": "Valorant"
  }
  ```
- **Response** `(200 OK)`: Updated team object.

### 4.4 Add Player to Team
- **Method & Route**: `POST /teams/:id/players`
- **Auth Required**: Yes (`org`)
- **Request Body**:
  ```json
  {
    "player_id": "uuid"
  }
  ```
- **Response** `(200 OK)`: Team membership status (flips team status to `active` automatically when 5th player joins).

### 4.5 Remove Player from Team
- **Method & Route**: `DELETE /teams/:id/players/:playerId`
- **Auth Required**: Yes (`org`)
- **Response** `(200 OK)`: Confirmation message.

---

## 5. Recruitment & Role Postings

### 5.1 Create Role Posting
- **Method & Route**: `POST /teams/:teamId/postings`
- **Auth Required**: Yes (`org`, `admin`, `root`)
- **Rate Limit**: Strict (10 req / hour)
- **Request Body**:
  ```json
  {
    "role_name": "Initiator / Sova main",
    "description": "Looking for Ascendant+ player for upcoming VCT qualifiers",
    "requirements": ["Ascendant+", "English comms", "Flexible schedule"]
  }
  ```
- **Response** `(201 Created)`: Posting details object.

### 5.2 List Team's Role Postings
- **Method & Route**: `GET /teams/:teamId/postings`
- **Auth Required**: No
- **Response** `(200 OK)`: Array of postings for the specified team.

### 5.3 Close Role Posting
- **Method & Route**: `PATCH /postings/:postingId/close`
- **Auth Required**: Yes (`org`, `admin`, `root`)
- **Response** `(200 OK)`: Updated posting object with `status: "closed"`.

### 5.4 Apply to Posting
- **Method & Route**: `POST /postings/:postingId/apply`
- **Auth Required**: Yes (`player`, `admin`, `root`)
- **Request Body**:
  ```json
  {
    "pitch": "Top 500 radiant player with 2 years tournament experience."
  }
  ```
- **Response** `(201 Created)`: Application object with initial status `applied`.

### 5.5 Get Application Details
- **Method & Route**: `GET /applications/:id`
- **Auth Required**: Yes (`player`, `org`, `admin`, `root`)
- **Response** `(200 OK)`:
  ```json
  {
    "id": "uuid",
    "posting_id": "uuid",
    "player_id": "uuid",
    "pitch": "...",
    "status": "applied" | "shortlisted" | "accepted" | "rejected",
    "created_at": "ISOString"
  }
  ```

### 5.6 Update Application Status
- **Method & Route**: `PATCH /applications/:id`
- **Auth Required**: Yes (`org`, `admin`, `root`)
- **State Flow**: `applied` → `shortlisted` → `accepted` | `rejected`
- **Request Body**:
  ```json
  {
    "status": "shortlisted" | "accepted" | "rejected"
  }
  ```
- **Response** `(200 OK)`: Updated application object.

---

## 6. Discovery & Search (`/discovery`)

### 6.1 Search Teams
- **Method & Route**: `GET /discovery/teams`
- **Auth Required**: No
- **Query Parameters**:
  - `game` (string, optional): e.g. `Valorant`
  - `status` (string, optional): `draft` | `active`
  - `name` (string, optional): Search keyword
  - `limit` (number, optional, default: 20)
  - `cursor` (string, optional): Cursor for next page
- **Response** `(200 OK)`:
  ```json
  {
    "items": [...],
    "next_cursor": "string | null",
    "has_more": false
  }
  ```

### 6.2 Search Tournaments
- **Method & Route**: `GET /discovery/tournaments`
- **Auth Required**: No
- **Query Parameters**:
  - `game` (string, optional)
  - `status` (string, optional): `upcoming` | `ongoing` | `completed`
  - `name` (string, optional)
  - `limit` (number, optional)
  - `cursor` (string, optional)
- **Response** `(200 OK)`:
  ```json
  {
    "items": [...],
    "next_cursor": "string | null",
    "has_more": false
  }
  ```

---

## 7. Social & Feed

### 7.1 Follow Org or Team
- **Method & Route**: `POST /follow`
- **Auth Required**: Yes (`player`)
- **Request Body**:
  ```json
  {
    "target_id": "uuid",
    "target_type": "org" | "team"
  }
  ```
- **Response** `(200 OK)`: `{ "success": true }`

### 7.2 Unfollow Org or Team
- **Method & Route**: `DELETE /follow`
- **Auth Required**: Yes (`player`)
- **Request Body**:
  ```json
  {
    "target_id": "uuid",
    "target_type": "org" | "team"
  }
  ```
- **Response** `(200 OK)`: `{ "success": true }`

### 7.3 Get Social Feed
- **Method & Route**: `GET /feed`
- **Auth Required**: Yes (`player`)
- **Query Parameters**:
  - `limit` (number, optional)
  - `cursor` (string, optional)
- **Response** `(200 OK)`: Paginated list of posts from followed orgs/teams.

### 7.4 Create Org Post
- **Method & Route**: `POST /posts`
- **Auth Required**: Yes (`org`)
- **Rate Limit**: Standard Write Limit (30 req / 15 min)
- **Request Body**:
  ```json
  {
    "content": "Excited to announce our new roster!",
    "media_url": "https://..."
  }
  ```
- **Response** `(201 Created)`: Created post object.

### 7.5 Get Single Post
- **Method & Route**: `GET /posts/:id`
- **Auth Required**: No
- **Response** `(200 OK)`: Post details object.

---

## 8. Direct Messaging (`/messages`)

### 8.1 Get Thread History
- **Method & Route**: `GET /messages/:threadId`
- **Auth Required**: Yes (`player`, `admin`, `root`)
- **Thread ID Format**: `<smaller_userId>:<larger_userId>` (alphabetically sorted UUIDs)
- **Query Parameters**:
  - `limit` (number, optional, default: 50)
  - `cursor` (string, optional)
- **Response** `(200 OK)`:
  ```json
  {
    "messages": [
      {
        "id": "uuid",
        "sender_id": "uuid",
        "receiver_id": "uuid",
        "content": "Hey, want to scrim tomorrow?",
        "created_at": "ISOString"
      }
    ],
    "next_cursor": "string | null"
  }
  ```

### 8.2 Send Direct Message
- **Method & Route**: `POST /messages/:threadId`
- **Auth Required**: Yes (`player`, `admin`, `root`)
- **Rate Limit**: Standard Write Limit
- **Request Body**:
  ```json
  {
    "receiver_id": "uuid",
    "content": "Hey, want to scrim tomorrow?"
  }
  ```
- **Response** `(201 Created)`: Sent message object.

---

## 9. Tournaments (`/tournaments`)

### 9.1 Create Tournament
- **Method & Route**: `POST /tournaments`
- **Auth Required**: Yes (`organizer`)
- **Rate Limit**: Strict (10 req / hour)
- **Request Body**:
  ```json
  {
    "name": "Gamers'G Championship 2026",
    "game": "Valorant",
    "start_date": "2026-11-01T10:00:00Z",
    "end_date": "2026-11-05T20:00:00Z",
    "max_teams": 16,
    "prize_pool": 10000
  }
  ```
- **Response** `(201 Created)`: Tournament details object.

### 9.2 Get Tournament Details
- **Method & Route**: `GET /tournaments/:id`
- **Auth Required**: No
- **Response** `(200 OK)`: Tournament object including organizer info, schedule, and team limit.

### 9.3 Update Tournament
- **Method & Route**: `PATCH /tournaments/:id`
- **Auth Required**: Yes (`organizer`)
- **Request Body**:
  ```json
  {
    "name": "Gamers'G Championship 2026 - Winter",
    "max_teams": 32
  }
  ```
- **Response** `(200 OK)`: Updated tournament object.

### 9.4 Register Team for Tournament
- **Method & Route**: `POST /tournaments/:id/register`
- **Auth Required**: Yes (`org`)
- **Request Body**:
  ```json
  {
    "team_id": "uuid"
  }
  ```
- **Response** `(201 Created)`: Registration object with `status: "pending"`.

### 9.5 List Tournament Registrations
- **Method & Route**: `GET /tournaments/:id/registrations`
- **Auth Required**: Yes (`organizer`)
- **Response** `(200 OK)`: Array of registered teams and approval statuses.

### 9.6 Approve / Reject Team Registration
- **Method & Route**: `PATCH /tournaments/:id/registrations/:regId`
- **Auth Required**: Yes (`organizer`)
- **Request Body**:
  ```json
  {
    "status": "approved" | "rejected"
  }
  ```
- **Response** `(200 OK)`: Updated registration object.

---

## 10. Admin Panel (`/admin`)

### 10.1 Verify Organization
- **Method & Route**: `PATCH /admin/orgs/:id/verify`
- **Auth Required**: Yes (`admin`, `root`)
- **Response** `(200 OK)`: `{ "success": true, "verified": true }`

### 10.2 Verify Tournament Organizer
- **Method & Route**: `PATCH /admin/organizers/:id/verify`
- **Auth Required**: Yes (`admin`, `root`)
- **Response** `(200 OK)`: `{ "success": true, "verified": true }`

### 10.3 List All Users
- **Method & Route**: `GET /admin/users`
- **Auth Required**: Yes (`admin`, `root`)
- **Response** `(200 OK)`: List of all registered users across all account types.

---

## 11. Real-time Events (Socket.io)

### Connection
- **URL**: `ws://localhost:5000`
- **Auth Payload**:
  ```javascript
  const socket = io("http://localhost:5000", {
    auth: { userId: "<current_user_id>" }
  });
  ```
- **Room**: Clients automatically join room `user:<userId>`.

### Inbound Events to Listen For

| Event Name | Payload Structure | Description |
|---|---|---|
| `new_message` | `{ "id": "uuid", "sender_id": "uuid", "content": "...", "created_at": "..." }` | Fired when the user receives a direct message |
| `application_status_changed` | `{ "application_id": "uuid", "status": "shortlisted" \| "accepted" \| "rejected" }` | Fired when an org updates a player's application |
| `new_post` | `{ "post_id": "uuid", "org_id": "uuid", "content": "...", "created_at": "..." }` | Fired when a followed org publishes a new post |

---

## 12. Standard Error Response Format

All error responses from the API adhere to the following schema:

```json
{
  "status": "error",
  "message": "Human-readable error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address format"
    }
  ]
}
```

### Common HTTP Status Codes:
- `400 Bad Request`: Validation failure or illegal state transition.
- `401 Unauthorized`: Missing or invalid JWT token.
- `403 Forbidden`: Role does not have permission for this resource.
- `404 Not Found`: Resource does not exist.
- `429 Too Many Requests`: Rate limit exceeded.
- `500 Internal Server Error`: Unhandled server exception.
