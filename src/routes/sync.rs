use axum::{
  extract::State,
  response::IntoResponse,
  routing::{get, post},
  Json, Router,
};
use serde::{Deserialize, Serialize};

use crate::{
  news, projects, services, solutions, team, testimonials, settings,
  state::AppState,
};

#[derive(Debug, Deserialize)]
struct SyncAllPayload {
  team: Option<serde_json::Value>,
  services: Option<serde_json::Value>,
  solutions: Option<serde_json::Value>,
  testimonials: Option<serde_json::Value>,
  contacts: Option<serde_json::Value>,
  news: Option<serde_json::Value>,
  jobs: Option<serde_json::Value>,
  applications: Option<serde_json::Value>,
  projects: Option<serde_json::Value>,
  settings: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
struct SyncBatchPayload {
  resolutions: Option<serde_json::Value>,
}

#[derive(Debug, Serialize)]
struct DataPayload {
  team: serde_json::Value,
  services: serde_json::Value,
  solutions: serde_json::Value,
  testimonials: serde_json::Value,
  contacts: serde_json::Value,
  news: serde_json::Value,
  jobs: serde_json::Value,
  applications: serde_json::Value,
  projects: serde_json::Value,
  settings: serde_json::Value,
}

const MAX_SYNC_JSON_BYTES: usize = 200_000;

fn validate_sync_value(v: &Option<serde_json::Value>) -> Result<(), axum::response::Response> {
  if let Some(val) = v {
    if !crate::validation::json_max_bytes(val, MAX_SYNC_JSON_BYTES) {
      return Err(crate::error::AppError::payload_too_large().into_response());
    }
    if !(val.is_object() || val.is_array()) {
      return Err(crate::error::AppError::bad_request().into_response());
    }
  }
  Ok(())
}

async fn get_data(State(state): State<AppState>) -> impl IntoResponse {
  let team_items = team::repo::list_visible(&state.db).await.unwrap_or_default();
  let services_items = services::repo::list(&state.db).await.unwrap_or_default();
  let solutions_items = solutions::repo::list(&state.db).await.unwrap_or_default();
  let testimonials_items = testimonials::repo::list_published(&state.db).await.unwrap_or_default();
  let news_items = news::repo::list_published(&state.db).await.unwrap_or_default();
  let projects_items = projects::repo::list(&state.db).await.unwrap_or_default();
  let settings_value = settings::repo::get(&state.db)
    .await
    .unwrap_or_else(|_| serde_json::json!({}));

  Json(DataPayload {
    team: serde_json::to_value(team_items).unwrap_or_else(|_| serde_json::json!([])),
    services: serde_json::to_value(services_items).unwrap_or_else(|_| serde_json::json!([])),
    solutions: serde_json::to_value(solutions_items).unwrap_or_else(|_| serde_json::json!([])),
    testimonials: serde_json::to_value(testimonials_items).unwrap_or_else(|_| serde_json::json!([])),
    contacts: serde_json::json!([]),
    news: serde_json::to_value(news_items).unwrap_or_else(|_| serde_json::json!([])),
    jobs: serde_json::json!([]),
    applications: serde_json::json!([]),
    projects: serde_json::to_value(projects_items).unwrap_or_else(|_| serde_json::json!([])),
    settings: settings_value,
  })
  .into_response()
}

async fn sync_all(Json(payload): Json<SyncAllPayload>) -> impl IntoResponse {
  if let Err(resp) = validate_sync_value(&payload.team) {
    return resp;
  }
  if let Err(resp) = validate_sync_value(&payload.services) {
    return resp;
  }
  if let Err(resp) = validate_sync_value(&payload.solutions) {
    return resp;
  }
  if let Err(resp) = validate_sync_value(&payload.testimonials) {
    return resp;
  }
  if let Err(resp) = validate_sync_value(&payload.contacts) {
    return resp;
  }
  if let Err(resp) = validate_sync_value(&payload.news) {
    return resp;
  }
  if let Err(resp) = validate_sync_value(&payload.jobs) {
    return resp;
  }
  if let Err(resp) = validate_sync_value(&payload.applications) {
    return resp;
  }
  if let Err(resp) = validate_sync_value(&payload.projects) {
    return resp;
  }
  if let Err(resp) = validate_sync_value(&payload.settings) {
    return resp;
  }

  let saved_keys = [
    payload.team.is_some(),
    payload.services.is_some(),
    payload.solutions.is_some(),
    payload.testimonials.is_some(),
    payload.contacts.is_some(),
    payload.news.is_some(),
    payload.jobs.is_some(),
    payload.applications.is_some(),
    payload.projects.is_some(),
    payload.settings.is_some(),
  ]
  .into_iter()
  .filter(|present| *present)
  .count();

  Json(serde_json::json!({
    "success": true,
    "savedKeys": saved_keys,
    "message": "sync accepted"
  }))
  .into_response()
}

async fn sync_batch(Json(payload): Json<SyncBatchPayload>) -> impl IntoResponse {
  if let Some(v) = &payload.resolutions {
    if !crate::validation::json_max_bytes(v, MAX_SYNC_JSON_BYTES) {
      return crate::error::AppError::payload_too_large().into_response();
    }
    if !v.is_array() {
      return crate::error::AppError::bad_request().into_response();
    }
  }

  let total = payload
    .resolutions
    .as_ref()
    .and_then(|value| value.as_array())
    .map(|items| items.len())
    .unwrap_or(0);

  Json(serde_json::json!({
    "success": true,
    "processed": total,
    "message": "batch sync accepted"
  }))
  .into_response()
}

pub fn router() -> Router<AppState> {
  Router::new()
    .route("/api/data", get(get_data))
    .route("/api/sync/all", post(sync_all))
    .route("/api/sync/batch", post(sync_batch))
}
