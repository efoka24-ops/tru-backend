use axum::{
  extract::{Path, State},
  http::StatusCode,
  response::IntoResponse,
  routing::{get, put},
  Json, Router,
};
use serde::Deserialize;
use uuid::Uuid;

use crate::{
  error::AppError,
  middleware::auth::{require_own_profile_or_admin, AuthUser},
  models::team::UpdateTeamMember,
  state::AppState,
};

#[derive(Debug, Deserialize)]
struct UpdatePhotoRequest {
  image_url: String,
}

async fn get_public(Path(id): Path<Uuid>, State(state): State<AppState>) -> impl IntoResponse {
  match crate::members::repo::get_public_member(&state.db, id).await {
    Ok(Some(m)) => Json(m).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "get_public_member failed");
      AppError::internal().into_response()
    }
  }
}

async fn get_profile(user: AuthUser, Path(id): Path<Uuid>, State(state): State<AppState>) -> impl IntoResponse {
  if let Err(err) = require_own_profile_or_admin(&user, id) {
    return err.into_response();
  }

  match crate::members::repo::get_member_profile(&state.db, id).await {
    Ok(Some(m)) => Json(m).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "get_member_profile failed");
      AppError::internal().into_response()
    }
  }
}

async fn put_profile(
  user: AuthUser,
  Path(id): Path<Uuid>,
  State(state): State<AppState>,
  Json(input): Json<UpdateTeamMember>,
) -> impl IntoResponse {
  if let Err(err) = require_own_profile_or_admin(&user, id) {
    return err.into_response();
  }

  match crate::members::repo::update_member_profile(&state.db, id, input).await {
    Ok(Some(m)) => Json(m).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "update_member_profile failed");
      AppError::internal().into_response()
    }
  }
}

async fn put_photo(
  user: AuthUser,
  Path(id): Path<Uuid>,
  State(state): State<AppState>,
  Json(req): Json<UpdatePhotoRequest>,
) -> impl IntoResponse {
  if let Err(err) = require_own_profile_or_admin(&user, id) {
    return err.into_response();
  }

  if req.image_url.len() > 2_000_000 {
    return AppError::payload_too_large().into_response();
  }

  match crate::members::repo::update_member_photo(&state.db, id, req.image_url).await {
    Ok(Some(m)) => Json(m).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "update_member_photo failed");
      AppError::internal().into_response()
    }
  }
}

pub fn router() -> Router<AppState> {
  Router::new()
    .route("/{id}", get(get_public))
    .route("/{id}/profile", get(get_profile).put(put_profile))
    .route("/{id}/photo", put(put_photo))
}
