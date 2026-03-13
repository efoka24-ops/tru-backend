use axum::{
  response::IntoResponse,
  routing::post,
  Json, Router,
};
use serde::Deserialize;

use crate::state::AppState;

#[derive(Debug, Deserialize)]
struct IncreaseImageLimitPayload {
  newLimit: Option<u64>,
}

async fn increase_image_limit(Json(payload): Json<IncreaseImageLimitPayload>) -> impl IntoResponse {
  Json(serde_json::json!({
    "success": true,
    "newLimit": payload.newLimit.unwrap_or(500),
    "message": "image limit acknowledged"
  }))
  .into_response()
}

pub fn router() -> Router<AppState> {
  Router::new().route("/api/config/increase-image-limit", post(increase_image_limit))
}
