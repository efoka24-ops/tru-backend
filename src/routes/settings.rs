use axum::{
  extract::State,
  response::IntoResponse,
  routing::get,
  Json, Router,
};

use crate::{
  error::AppError,
  middleware::auth::{require_admin, AuthUser},
  settings,
  state::AppState,
};

async fn get_settings(State(state): State<AppState>) -> impl IntoResponse {
  match settings::repo::get(&state.db).await {
    Ok(data) => Json(data).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "settings get failed");
      AppError::internal().into_response()
    }
  }
}

async fn update_settings(
  user: AuthUser,
  State(state): State<AppState>,
  Json(body): Json<serde_json::Value>,
) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  if !body.is_object() {
    return AppError::bad_request().into_response();
  }
  if body.to_string().len() > 65536 {
    return AppError::payload_too_large().into_response();
  }
  match settings::repo::upsert(&state.db, body).await {
    Ok(data) => Json(data).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "settings update failed");
      AppError::internal().into_response()
    }
  }
}

pub fn router() -> Router<AppState> {
  Router::new().route("/", get(get_settings).put(update_settings))
}
