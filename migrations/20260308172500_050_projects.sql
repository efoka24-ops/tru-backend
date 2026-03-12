-- Projects (projets realises)

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  client TEXT,
  description TEXT,
  category TEXT,
  status TEXT,
  technologies JSONB NOT NULL DEFAULT '[]'::jsonb,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_projects_set_updated_at ON projects;
CREATE TRIGGER trg_projects_set_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
