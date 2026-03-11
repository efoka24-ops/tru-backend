 mod config;
mod db;
mod auth;
mod middleware;
mod routes;
mod models;
mod team;
mod services;
mod solutions;
mod news;
mod testimonials;
mod jobs;
mod applications;
mod contacts;
mod projects;
mod members;
mod admin_members;
mod state;
mod validation;
mod error;

use std::net::SocketAddr;

use axum::{
  http::{header, HeaderValue, Method},
  Router,
};
use axum::middleware::from_fn;
use tower_governor::{governor::GovernorConfigBuilder, GovernorLayer};
use tower_http::cors::{AllowOrigin, CorsLayer};
use tower_http::limit::RequestBodyLimitLayer;
use tower_http::set_header::SetResponseHeaderLayer;
use tower_http::trace::TraceLayer;
use tracing::{info, Level};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
  // Load .env if present
  let _ = dotenvy::dotenv();

  tracing_subscriber::fmt()
    .with_env_filter(
      EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
    )
    .with_max_level(Level::TRACE)
    .init();

  let cfg = config::AppConfig::from_env()?;

  let db = db::connect_with_retry(&cfg.database_url).await?;
  db::migrate(&db).await?;

  // One-time admin bootstrap (only if no admin exists).
  if !crate::auth::repo::any_admin_exists(&db).await? {
    match (cfg.admin_email.as_deref(), cfg.admin_password.as_deref()) {
      (Some(email), Some(password)) => {
        if password.trim().len() < 8 || password.trim().len() > 128 {
          tracing::warn!("ADMIN_PASSWORD must be 8..128 characters; skipping admin bootstrap");
        } else {
          let password_hash = match crate::auth::password::hash_password(password) {
            Ok(h) => h,
            Err(err) => {
              tracing::warn!(error = %err, "failed to hash ADMIN_PASSWORD; skipping admin bootstrap");
              String::new()
            }
          };

          if !password_hash.is_empty() {
            let _admin = crate::auth::repo::create_or_promote_admin(&db, email, None, &password_hash).await?;
            info!("bootstrap admin ensured");
          }
        }
      }
      _ => {
        tracing::warn!("no admin user exists and ADMIN_EMAIL/ADMIN_PASSWORD not set; skipping admin bootstrap");
      }
    }
  }

  let state = state::AppState {
    db,
    jwt_secret: cfg.jwt_secret.clone(),
  };

  let allowed_origins: Vec<HeaderValue> = cfg
    .cors_origins
    .iter()
    .filter_map(|o| o.parse::<HeaderValue>().ok())
    .collect();

  let cors = CorsLayer::new()
    .allow_origin(AllowOrigin::list(allowed_origins))
    .allow_methods([
      Method::GET,
      Method::POST,
      Method::PUT,
      Method::DELETE,
      Method::OPTIONS,
    ])
    .allow_headers([
      header::AUTHORIZATION,
      header::CONTENT_TYPE,
      header::ACCEPT,
      header::ORIGIN,
    ])
    .allow_credentials(false);

  let security_headers = (
    SetResponseHeaderLayer::if_not_present(header::X_CONTENT_TYPE_OPTIONS, HeaderValue::from_static("nosniff")),
    SetResponseHeaderLayer::if_not_present(header::X_FRAME_OPTIONS, HeaderValue::from_static("DENY")),
    SetResponseHeaderLayer::if_not_present(header::REFERRER_POLICY, HeaderValue::from_static("no-referrer")),
  );

  let app = Router::<state::AppState>::new()
    .merge(routes::health::router())
    .nest("/api/auth", routes::auth::router())
    .nest("/api/team", routes::team::router())
    .nest("/api/members", routes::members::router())
    .nest("/api/admin", routes::admin_members::router())
    .nest("/api/services", routes::services::router())
    .nest("/api/solutions", routes::solutions::router())
    .nest("/api/news", routes::news::router())
    .nest("/api/testimonials", routes::testimonials::router())
    .nest("/api/jobs", routes::jobs::router())
    .nest("/api/applications", routes::applications::router())
    .nest("/api/contacts", routes::contacts::router())
    .nest("/api/projects", routes::projects::router())
    .with_state(state)
    .layer(RequestBodyLimitLayer::new(5 * 1024 * 1024))
    .layer(from_fn(crate::middleware::timeout::timeout_middleware))
    .layer(TraceLayer::new_for_http())
    .layer(security_headers.0)
    .layer(security_headers.1)
    .layer(security_headers.2)
    .layer(cors);

  let app = if cfg.disable_rate_limit {
    app
  } else {
    let governor_conf = GovernorConfigBuilder::default()
      .per_second(5)
      .burst_size(20)
      .finish()
      .unwrap();
    app.layer(GovernorLayer { config: std::sync::Arc::new(governor_conf) })
  };

  let addr = SocketAddr::from(([0, 0, 0, 0], cfg.port));
  info!("listening on {}", addr);

  let listener = tokio::net::TcpListener::bind(addr).await?;
  axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>()).await?;

  Ok(())
}
