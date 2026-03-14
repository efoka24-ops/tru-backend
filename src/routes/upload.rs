use axum::{
  extract::Multipart,
  response::IntoResponse,
  routing::post,
  Json, Router,
};
use base64::{engine::general_purpose::STANDARD as B64, Engine};

use crate::{error::AppError, state::AppState};

const MAX_UPLOAD_BYTES: usize = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME: &[&str] = &["image/jpeg", "image/png", "image/gif", "image/webp"];

async fn handle_upload(mut multipart: Multipart) -> impl IntoResponse {
  while let Ok(Some(field)) = multipart.next_field().await {
    let name = field.name().unwrap_or("").to_string();
    if name != "image" {
      continue;
    }

    // Detect MIME from content-type header
    let content_type = field
      .content_type()
      .unwrap_or("application/octet-stream")
      .to_string();

    if content_type.is_empty() || content_type.len() > 100 {
      return AppError::bad_request().into_response();
    }

    if !ALLOWED_MIME.iter().any(|m| content_type.starts_with(m)) {
      return (
        axum::http::StatusCode::UNSUPPORTED_MEDIA_TYPE,
        Json(serde_json::json!({ "error": "unsupported_media_type" })),
      )
        .into_response();
    }

    // Read bytes with size limit
    let bytes = match field.bytes().await {
      Ok(b) => b,
      Err(_) => return AppError::bad_request().into_response(),
    };

    if bytes.len() > MAX_UPLOAD_BYTES {
      return AppError::payload_too_large().into_response();
    }

    // Return as base64 data URL so it works without a file server
    let encoded = B64.encode(&bytes);
    let data_url = format!("data:{};base64,{}", content_type, encoded);

    return Json(serde_json::json!({ "url": data_url })).into_response();
  }

  AppError::bad_request().into_response()
}

pub fn router() -> Router<AppState> {
  Router::new()
    // FormationsPage image upload
    .route("/upload", post(handle_upload))
    // Team photo upload (backoffice uploadTeamPhoto helper)
    .route("/uploads/team-photo", post(handle_upload))
}
