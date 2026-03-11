use std::env;

#[derive(Clone, Debug)]
pub struct AppConfig {
  pub database_url: String,
  pub port: u16,
  pub jwt_secret: String,
  pub cors_origins: Vec<String>,
  pub admin_email: Option<String>,
  pub admin_password: Option<String>,
  pub disable_rate_limit: bool,
}

impl AppConfig {
  pub fn from_env() -> Result<Self, &'static str> {
    let database_url = env::var("DATABASE_URL")
      .map_err(|_| "DATABASE_URL is required (PostgreSQL connection string)")?;

    let port = env::var("PORT")
      .ok()
      .and_then(|v| v.parse().ok())
      .unwrap_or(5000);

    let jwt_secret = env::var("JWT_SECRET").map_err(|_| "JWT_SECRET is required")?;

    let cors_origins = env::var("CORS_ORIGINS")
      .ok()
      .map(|v| {
        v.split(',')
          .map(|s| s.trim().to_string())
          .filter(|s| !s.is_empty())
          .collect::<Vec<_>>()
      })
      .filter(|v| !v.is_empty())
      .unwrap_or_else(|| {
        vec![
          "http://localhost:3000".to_string(),
          "http://localhost:5173".to_string(),
        ]
      });

    let admin_email = env::var("ADMIN_EMAIL").ok().map(|s| s.trim().to_string()).filter(|s| !s.is_empty());
    let admin_password = env::var("ADMIN_PASSWORD").ok().map(|s| s.trim().to_string()).filter(|s| !s.is_empty());

    let disable_rate_limit = env::var("DISABLE_RATE_LIMIT")
      .ok()
      .map(|v| v.trim() == "1" || v.trim().eq_ignore_ascii_case("true"))
      .unwrap_or(false);

    Ok(Self {
      database_url,
      port,
      jwt_secret,
      cors_origins,
      admin_email,
      admin_password,
      disable_rate_limit,
    })
  }
}
