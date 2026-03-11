-- Base / extensions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Updated at helper
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';
