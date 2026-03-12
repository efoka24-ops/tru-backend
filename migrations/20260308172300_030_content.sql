-- Content: services, solutions, news, testimonials

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  icon TEXT,
  title TEXT NOT NULL,
  description TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  objective TEXT,
  color TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_services_set_updated_at ON services;
CREATE TRIGGER trg_services_set_updated_at
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS solutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_solutions_set_updated_at ON solutions;
CREATE TRIGGER trg_solutions_set_updated_at
BEFORE UPDATE ON solutions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_news_set_updated_at ON news;
CREATE TRIGGER trg_news_set_updated_at
BEFORE UPDATE ON news
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  title TEXT,
  company TEXT,
  message TEXT,
  rating INT,
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_testimonials_set_updated_at ON testimonials;
CREATE TRIGGER trg_testimonials_set_updated_at
BEFORE UPDATE ON testimonials
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
