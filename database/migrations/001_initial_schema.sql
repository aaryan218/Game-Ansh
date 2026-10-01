-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ACCOUNT TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS "org" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "tournament_organizer" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "team" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES "org"(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  game VARCHAR(100) NOT NULL DEFAULT '',
  status VARCHAR(10) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "player" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  game_ign VARCHAR(100),
  team_id UUID REFERENCES "team"(id) ON DELETE SET NULL,
  org_id UUID REFERENCES "org"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT player_exclusivity CHECK (
    team_id IS NULL OR org_id IS NULL
  )
);

-- Admin table (internal use)
CREATE TABLE IF NOT EXISTS "admin" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RECRUITMENT
-- ============================================================

CREATE TABLE IF NOT EXISTS "role_posting" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES "team"(id) ON DELETE CASCADE,
  role VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(10) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "application" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES "player"(id) ON DELETE CASCADE,
  posting_id UUID NOT NULL REFERENCES "role_posting"(id) ON DELETE CASCADE,
  status VARCHAR(15) NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (player_id, posting_id)
);

-- ============================================================
-- SOCIAL
-- ============================================================

CREATE TABLE IF NOT EXISTS "follow" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES "player"(id) ON DELETE CASCADE,
  target_type VARCHAR(10) NOT NULL CHECK (target_type IN ('org', 'team')),
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (player_id, target_type, target_id)
);

CREATE TABLE IF NOT EXISTS "post" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_type VARCHAR(10) NOT NULL CHECK (author_type IN ('org', 'team')),
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MESSAGING
-- ============================================================

CREATE TABLE IF NOT EXISTS "message" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES "player"(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES "player"(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TOURNAMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS "tournament" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES "tournament_organizer"(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  game VARCHAR(100) NOT NULL,
  start_date TIMESTAMPTZ,
  status VARCHAR(15) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "registration" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES "tournament"(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES "team"(id) ON DELETE CASCADE,
  status VARCHAR(15) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tournament_id, team_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_player_team ON "player"(team_id);
CREATE INDEX IF NOT EXISTS idx_player_org ON "player"(org_id);
CREATE INDEX IF NOT EXISTS idx_team_org ON "team"(org_id);
CREATE INDEX IF NOT EXISTS idx_role_posting_team ON "role_posting"(team_id);
CREATE INDEX IF NOT EXISTS idx_application_player ON "application"(player_id);
CREATE INDEX IF NOT EXISTS idx_application_posting ON "application"(posting_id);
CREATE INDEX IF NOT EXISTS idx_follow_player ON "follow"(player_id);
CREATE INDEX IF NOT EXISTS idx_post_author ON "post"(author_id, author_type);
CREATE INDEX IF NOT EXISTS idx_message_sender ON "message"(sender_id);
CREATE INDEX IF NOT EXISTS idx_message_receiver ON "message"(receiver_id);
CREATE INDEX IF NOT EXISTS idx_tournament_organizer ON "tournament"(organizer_id);
CREATE INDEX IF NOT EXISTS idx_registration_tournament ON "registration"(tournament_id);
