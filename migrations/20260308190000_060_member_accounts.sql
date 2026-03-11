-- Link user accounts to team members + login code flow

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS member_id UUID UNIQUE,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','pending','inactive')),
  ADD COLUMN IF NOT EXISTS login_code TEXT,
  ADD COLUMN IF NOT EXISTS login_code_expiry TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_users_member'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT fk_users_member
      FOREIGN KEY (member_id) REFERENCES team_members(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_member_id ON users(member_id);
CREATE INDEX IF NOT EXISTS idx_users_login_code ON users(login_code);
