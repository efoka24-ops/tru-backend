use axum::{
  extract::{Path, State},
  response::IntoResponse,
  routing::get,
  Json, Router,
};

use crate::{
  error::AppError,
  jobs,
  middleware::auth::{require_admin, AuthUser},
  models::jobs::{CreateJob, UpdateJob},
  state::AppState,
};

fn validate_create(input: &CreateJob) -> Result<(), axum::response::Response> {
  if !crate::validation::non_empty_trimmed(&input.title) || !crate::validation::max_len(&input.title, 200) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  if !crate::validation::opt_max_len(&input.description, 20_000)
    || !crate::validation::opt_max_len(&input.location, 200)
    || !crate::validation::opt_max_len(&input.job_type, 100)
    || !crate::validation::opt_max_len(&input.salary_range, 100)
  {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  Ok(())
}

fn validate_update(input: &UpdateJob) -> Result<(), axum::response::Response> {
  if let Some(title) = &input.title {
    if !crate::validation::non_empty_trimmed(title) || !crate::validation::max_len(title, 200) {
      return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
    }
  }
  if !crate::validation::opt_max_len(&input.description, 20_000)
    || !crate::validation::opt_max_len(&input.location, 200)
    || !crate::validation::opt_max_len(&input.job_type, 100)
    || !crate::validation::opt_max_len(&input.salary_range, 100)
  {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  Ok(())
}

async fn list(State(state): State<AppState>) -> impl IntoResponse {
  match jobs::repo::list_published(&state.db).await {
    Ok(items) => Json(items).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "jobs list failed");
      AppError::internal().into_response()
    }
  }
}

async fn list_all(user: AuthUser, State(state): State<AppState>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  match jobs::repo::list_all(&state.db).await {
    Ok(items) => Json(items).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "jobs list_all failed");
      AppError::internal().into_response()
    }
  }
}

async fn get_by_id(State(state): State<AppState>, Path(id): Path<uuid::Uuid>) -> impl IntoResponse {
  match jobs::repo::get_by_id(&state.db, id).await {
    Ok(Some(item)) => Json(item).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "jobs get failed");
      AppError::internal().into_response()
    }
  }
}

async fn create(user: AuthUser, State(state): State<AppState>, Json(input): Json<CreateJob>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  if let Err(resp) = validate_create(&input) {
    return resp;
  }
  match jobs::repo::create(&state.db, input).await {
    Ok(item) => (axum::http::StatusCode::CREATED, Json(item)).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "jobs create failed");
      AppError::internal().into_response()
    }
  }
}

async fn update(user: AuthUser, State(state): State<AppState>, Path(id): Path<uuid::Uuid>, Json(input): Json<UpdateJob>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  if let Err(resp) = validate_update(&input) {
    return resp;
  }
  match jobs::repo::update(&state.db, id, input).await {
    Ok(Some(item)) => Json(item).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "jobs update failed");
      AppError::internal().into_response()
    }
  }
}

async fn remove(user: AuthUser, State(state): State<AppState>, Path(id): Path<uuid::Uuid>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  match jobs::repo::delete(&state.db, id).await {
    Ok(true) => axum::http::StatusCode::NO_CONTENT.into_response(),
    Ok(false) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "jobs delete failed");
      AppError::internal().into_response()
    }
  }
}

pub fn router() -> Router<AppState> {
  Router::new()
    .route("/", get(list).post(create))
    .route("/all", get(list_all))
    .route("/{id}", get(get_by_id).put(update).delete(remove))
}
