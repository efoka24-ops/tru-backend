-- Team members

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  title TEXT,
  role TEXT,
  email TEXT,
  phone TEXT,
  image_url TEXT,
  description TEXT,
  bio TEXT,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  ordering INT,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  is_founder BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_team_members_set_updated_at ON team_members;
CREATE TRIGGER trg_team_members_set_updated_at
BEFORE UPDATE ON team_members
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
