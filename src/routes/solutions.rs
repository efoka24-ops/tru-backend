use axum::{
  extract::{Path, State},
  response::IntoResponse,
  routing::get,
  Json, Router,
};

use crate::{
  error::AppError,
  middleware::auth::{require_admin, AuthUser},
  models::solutions::{CreateSolution, UpdateSolution},
  solutions,
  state::AppState,
};

fn validate_create(input: &CreateSolution) -> Result<(), AppError> {
  if !crate::validation::non_empty_trimmed(&input.title) || !crate::validation::max_len(&input.title, 200) {
    return Err(AppError::bad_request());
  }
  if !crate::validation::json_opt_max_bytes(&input.details, 20_000) {
    return Err(AppError::bad_request());
  }
  Ok(())
}

fn validate_update(input: &UpdateSolution) -> Result<(), AppError> {
  if let Some(title) = &input.title {
    if !crate::validation::non_empty_trimmed(title) || !crate::validation::max_len(title, 200) {
      return Err(AppError::bad_request());
    }
  }
  if !crate::validation::json_opt_max_bytes(&input.details, 20_000) {
    return Err(AppError::bad_request());
  }
  Ok(())
}

async fn list(State(state): State<AppState>) -> impl IntoResponse {
  match solutions::repo::list(&state.db).await {
    Ok(items) => Json(items).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "solutions list failed");
      AppError::internal().into_response()
    }
  }
}

async fn get_by_id(State(state): State<AppState>, Path(id): Path<uuid::Uuid>) -> impl IntoResponse {
  match solutions::repo::get_by_id(&state.db, id).await {
    Ok(Some(item)) => Json(item).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "solutions get failed");
      AppError::internal().into_response()
    }
  }
}

async fn create(user: AuthUser, State(state): State<AppState>, Json(input): Json<CreateSolution>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }

  if let Err(resp) = validate_create(&input) {
    return resp.into_response();
  }
  match solutions::repo::create(&state.db, input).await {
    Ok(item) => (axum::http::StatusCode::CREATED, Json(item)).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "solutions create failed");
      AppError::internal().into_response()
    }
  }
}

async fn update(user: AuthUser, State(state): State<AppState>, Path(id): Path<uuid::Uuid>, Json(input): Json<UpdateSolution>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }

  if let Err(resp) = validate_update(&input) {
    return resp.into_response();
  }
  match solutions::repo::update(&state.db, id, input).await {
    Ok(Some(item)) => Json(item).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "solutions update failed");
      AppError::internal().into_response()
    }
  }
}

async fn remove(user: AuthUser, State(state): State<AppState>, Path(id): Path<uuid::Uuid>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  match solutions::repo::delete(&state.db, id).await {
    Ok(true) => axum::http::StatusCode::NO_CONTENT.into_response(),
    Ok(false) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "solutions delete failed");
      AppError::internal().into_response()
    }
  }
}

pub fn router() -> Router<AppState> {
  Router::new()
    .route("/", get(list).post(create))
    .route("/{id}", get(get_by_id).put(update).delete(remove))
}
