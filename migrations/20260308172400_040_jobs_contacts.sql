-- Jobs, applications, contacts

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  job_type TEXT,
  salary_range TEXT,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_jobs_set_updated_at ON jobs;
CREATE TRIGGER trg_jobs_set_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_applications_set_updated_at ON applications;
CREATE TRIGGER trg_applications_set_updated_at
BEFORE UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT,
  phone TEXT,
  subject TEXT,
  message TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_contacts_set_updated_at ON contacts;
CREATE TRIGGER trg_contacts_set_updated_at
BEFORE UPDATE ON contacts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
