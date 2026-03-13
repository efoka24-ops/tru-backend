use axum::{
  response::IntoResponse,
  routing::{get, post},
  Json, Router,
};
use serde::Deserialize;

use crate::state::AppState;

#[derive(Debug, Deserialize)]
struct LogEntry {
  timestamp: Option<String>,
  level: Option<String>,
  message: Option<String>,
  data: Option<serde_json::Value>,
  userAgent: Option<String>,
  url: Option<String>,
}

async fn create_log(Json(entry): Json<LogEntry>) -> impl IntoResponse {
  tracing::info!(
    level = ?entry.level,
    message = ?entry.message,
    timestamp = ?entry.timestamp,
    url = ?entry.url,
    user_agent = ?entry.userAgent,
    data = ?entry.data,
    "frontend log received"
  );

  (axum::http::StatusCode::CREATED, Json(serde_json::json!({ "success": true }))).into_response()
}

async fn list_logs() -> impl IntoResponse {
  Json(serde_json::json!({ "logs": [] })).into_response()
}

pub fn router() -> Router<AppState> {
  Router::new().route("/api/logs", get(list_logs).post(create_log))
}
