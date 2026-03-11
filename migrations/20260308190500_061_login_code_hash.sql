-- Store only hashed login codes (never plain)

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS login_code_hash TEXT;

-- If the plain login_code column exists (from previous migration), we keep it for now,
-- but the application must stop using it.
