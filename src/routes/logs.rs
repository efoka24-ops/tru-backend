use axum::{
  response::IntoResponse,
  routing::get,
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
  #[serde(rename = "userAgent")]
  user_agent: Option<String>,
  url: Option<String>,
}

fn validate_log(entry: &LogEntry) -> Result<(), axum::response::Response> {
  if !crate::validation::opt_max_len(&entry.timestamp, 64)
    || !crate::validation::opt_max_len(&entry.level, 32)
    || !crate::validation::opt_max_len(&entry.message, 20_000)
    || !crate::validation::opt_max_len(&entry.user_agent, 512)
    || !crate::validation::opt_max_len(&entry.url, 2048)
  {
    return Err(crate::error::AppError::bad_request().into_response());
  }
  if !crate::validation::json_opt_max_bytes(&entry.data, 50_000) {
    return Err(crate::error::AppError::payload_too_large().into_response());
  }
  Ok(())
}

async fn create_log(Json(entry): Json<LogEntry>) -> impl IntoResponse {
  if let Err(resp) = validate_log(&entry) {
    return resp;
  }
  tracing::info!(
    level = ?entry.level,
    message = ?entry.message,
    timestamp = ?entry.timestamp,
    url = ?entry.url,
    user_agent = ?entry.user_agent,
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
