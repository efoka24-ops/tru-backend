use sqlx::{postgres::PgPoolOptions, PgPool};
use std::time::Duration;
use tokio::time::sleep;

pub async fn connect(database_url: &str) -> Result<PgPool, sqlx::Error> {
  PgPoolOptions::new()
    .max_connections(10)
    .min_connections(0)
    .acquire_timeout(Duration::from_secs(30))
    .connect(database_url)
    .await
}

pub async fn connect_with_retry(database_url: &str) -> Result<PgPool, sqlx::Error> {
  // Wait up to ~60s for Postgres to be reachable (useful with docker compose)
  let mut delay = Duration::from_millis(250);
  for _attempt in 1..=10 {
    match connect(database_url).await {
      Ok(pool) => {
        // Ensure it can actually run a query
        match sqlx::query_scalar::<_, i32>("SELECT 1").fetch_one(&pool).await {
          Ok(_) => return Ok(pool),
          Err(err) => {
            tracing::warn!(error = %err, "DB not ready yet");
          }
        }
      }
      Err(err) => {
        tracing::warn!(error = %err, "DB connect attempt failed");
      }
    }

    // Backoff
    sleep(delay).await;
    delay = std::cmp::min(delay * 2, Duration::from_secs(5));
  }

  // Final attempt returns the real error
  connect(database_url).await
}

pub async fn migrate(pool: &PgPool) -> Result<(), sqlx::migrate::MigrateError> {
  sqlx::migrate!().run(pool).await
}
