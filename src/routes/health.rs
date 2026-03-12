use axum::{
  extract::State,
  response::{IntoResponse, Response},
  routing::get,
  Json, Router,
};
use serde::Serialize;
use crate::state::AppState;

#[derive(Serialize)]
struct HealthResponse {
  status: &'static str,
}

async fn root() -> impl IntoResponse {
  Json(serde_json::json!({
    "status": "Backend is running",
    "message": "TRU Backend API (Rust)",
    "endpoints": { "health": "/api/health" }
  }))
}

async fn health(State(state): State<AppState>) -> Response {
  let db_ok = match sqlx::query_scalar::<_, i32>("SELECT 1")
    .fetch_one(&state.db)
    .await
  {
    Ok(_) => true,
    Err(err) => {
      tracing::warn!(error = %err, "health DB check failed");
      false
    }
  };

  if db_ok {
    Json(HealthResponse { status: "ok" }).into_response()
  } else {
    (
      axum::http::StatusCode::SERVICE_UNAVAILABLE,
      Json(HealthResponse { status: "db_error" }),
    )
      .into_response()
  }
}

pub fn router() -> Router<AppState> {
  Router::new().route("/", get(root)).route("/api/health", get(health))
}
