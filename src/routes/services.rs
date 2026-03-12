use axum::{
  extract::{Path, State},
  response::IntoResponse,
  routing::get,
  Json, Router,
};

use crate::{
  error::AppError,
  middleware::auth::{require_admin, AuthUser},
  models::services::{CreateService, UpdateService},
  services,
  state::AppState,
};

fn validate_create(input: &CreateService) -> Result<(), AppError> {
  if !crate::validation::non_empty_trimmed(&input.title) {
    return Err(AppError::bad_request());
  }
  if !crate::validation::max_len(&input.title, 200) {
    return Err(AppError::bad_request());
  }
  if !crate::validation::opt_max_len(&input.description, 2000) {
    return Err(AppError::bad_request());
  }
  if !crate::validation::opt_max_len(&input.icon, 64)
    || !crate::validation::opt_max_len(&input.color, 32)
  {
    return Err(AppError::bad_request());
  }
  if !crate::validation::json_opt_max_bytes(&input.features, 10_000) {
    return Err(AppError::bad_request());
  }
  if !crate::validation::opt_url_ok(&input.image_url) {
    return Err(AppError::bad_request());
  }
  Ok(())
}

fn validate_update(input: &UpdateService) -> Result<(), AppError> {
  if let Some(title) = &input.title {
    if !crate::validation::non_empty_trimmed(title) || !crate::validation::max_len(title, 200) {
      return Err(AppError::bad_request());
    }
  }
  if !crate::validation::opt_max_len(&input.description, 2000) {
    return Err(AppError::bad_request());
  }
  if !crate::validation::opt_max_len(&input.icon, 64)
    || !crate::validation::opt_max_len(&input.color, 32)
  {
    return Err(AppError::bad_request());
  }
  if !crate::validation::json_opt_max_bytes(&input.features, 10_000) {
    return Err(AppError::bad_request());
  }
  if !crate::validation::opt_url_ok(&input.image_url) {
    return Err(AppError::bad_request());
  }
  Ok(())
}

async fn list(State(state): State<AppState>) -> impl IntoResponse {
  match services::repo::list(&state.db).await {
    Ok(items) => Json(items).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "services list failed");
      AppError::internal().into_response()
    }
  }
}

async fn get_by_id(State(state): State<AppState>, Path(id): Path<uuid::Uuid>) -> impl IntoResponse {
  match services::repo::get_by_id(&state.db, id).await {
    Ok(Some(item)) => Json(item).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "services get failed");
      AppError::internal().into_response()
    }
  }
}

async fn create(user: AuthUser, State(state): State<AppState>, Json(input): Json<CreateService>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }

  if let Err(resp) = validate_create(&input) {
    return resp.into_response();
  }
  match services::repo::create(&state.db, input).await {
    Ok(item) => (axum::http::StatusCode::CREATED, Json(item)).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "services create failed");
      AppError::internal().into_response()
    }
  }
}

async fn update(user: AuthUser, State(state): State<AppState>, Path(id): Path<uuid::Uuid>, Json(input): Json<UpdateService>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }

  if let Err(resp) = validate_update(&input) {
    return resp.into_response();
  }
  match services::repo::update(&state.db, id, input).await {
    Ok(Some(item)) => Json(item).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "services update failed");
      AppError::internal().into_response()
    }
  }
}

async fn remove(user: AuthUser, State(state): State<AppState>, Path(id): Path<uuid::Uuid>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  match services::repo::delete(&state.db, id).await {
    Ok(true) => axum::http::StatusCode::NO_CONTENT.into_response(),
    Ok(false) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "services delete failed");
      AppError::internal().into_response()
    }
  }
}

pub fn router() -> Router<AppState> {
  Router::new()
    .route("/", get(list).post(create))
    .route("/{id}", get(get_by_id).put(update).delete(remove))
}
