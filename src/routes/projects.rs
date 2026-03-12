use axum::{
  extract::{Path, State},
  response::IntoResponse,
  routing::get,
  Json, Router,
};

use crate::{
  error::AppError,
  middleware::auth::{require_admin, AuthUser},
  models::projects::{CreateProject, UpdateProject},
  projects,
  state::AppState,
};

fn validate_create(input: &CreateProject) -> Result<(), axum::response::Response> {
  if !crate::validation::non_empty_trimmed(&input.name) || !crate::validation::max_len(&input.name, 200) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  if !crate::validation::opt_max_len(&input.client, 200) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  if !crate::validation::opt_max_len(&input.description, 20_000)
    || !crate::validation::opt_max_len(&input.category, 200)
    || !crate::validation::opt_max_len(&input.status, 100)
  {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  if !crate::validation::json_opt_max_bytes(&input.technologies, 10_000) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  if !crate::validation::json_opt_max_bytes(&input.details, 20_000) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  Ok(())
}

fn validate_update(input: &UpdateProject) -> Result<(), axum::response::Response> {
  if let Some(name) = &input.name {
    if !crate::validation::non_empty_trimmed(name) || !crate::validation::max_len(name, 200) {
      return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
    }
  }
  if !crate::validation::opt_max_len(&input.client, 200) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  if !crate::validation::opt_max_len(&input.description, 20_000)
    || !crate::validation::opt_max_len(&input.category, 200)
    || !crate::validation::opt_max_len(&input.status, 100)
  {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  if !crate::validation::json_opt_max_bytes(&input.technologies, 10_000) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  if !crate::validation::json_opt_max_bytes(&input.details, 20_000) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  Ok(())
}

async fn list(State(state): State<AppState>) -> impl IntoResponse {
  match projects::repo::list(&state.db).await {
    Ok(items) => Json(items).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "projects list failed");
      AppError::internal().into_response()
    }
  }
}

async fn get_by_id(State(state): State<AppState>, Path(id): Path<uuid::Uuid>) -> impl IntoResponse {
  match projects::repo::get_by_id(&state.db, id).await {
    Ok(Some(item)) => Json(item).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "projects get failed");
      AppError::internal().into_response()
    }
  }
}

async fn create(user: AuthUser, State(state): State<AppState>, Json(input): Json<CreateProject>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  if let Err(resp) = validate_create(&input) {
    return resp;
  }
  match projects::repo::create(&state.db, input).await {
    Ok(item) => (axum::http::StatusCode::CREATED, Json(item)).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "projects create failed");
      AppError::internal().into_response()
    }
  }
}

async fn update(user: AuthUser, State(state): State<AppState>, Path(id): Path<uuid::Uuid>, Json(input): Json<UpdateProject>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  if let Err(resp) = validate_update(&input) {
    return resp;
  }
  match projects::repo::update(&state.db, id, input).await {
    Ok(Some(item)) => Json(item).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "projects update failed");
      AppError::internal().into_response()
    }
  }
}

async fn remove(user: AuthUser, State(state): State<AppState>, Path(id): Path<uuid::Uuid>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  match projects::repo::delete(&state.db, id).await {
    Ok(true) => axum::http::StatusCode::NO_CONTENT.into_response(),
    Ok(false) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "projects delete failed");
      AppError::internal().into_response()
    }
  }
}

pub fn router() -> Router<AppState> {
  Router::new()
    .route("/", get(list).post(create))
    .route("/{id}", get(get_by_id).put(update).delete(remove))
}
