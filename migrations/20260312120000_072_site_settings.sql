-- TABLE PARAMETRES SITE - TRU GROUP
-- Single-row JSONB table for site-wide settings (logo, contact info, etc.)

CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  CONSTRAINT settings_single_row CHECK (id = 1),
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_site_settings_set_updated_at ON site_settings;
CREATE TRIGGER trg_site_settings_set_updated_at
BEFORE UPDATE ON site_settings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Insert default empty settings row
INSERT INTO site_settings (id, data)
VALUES (1, '{}')
ON CONFLICT (id) DO NOTHING;
