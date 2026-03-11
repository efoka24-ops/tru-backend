use axum::{
  extract::{Path, State},
  response::IntoResponse,
  routing::get,
  Json, Router,
};

use crate::{
  error::AppError,
  applications,
  middleware::auth::{require_admin, AuthUser},
  models::applications::{CreateApplication, UpdateApplication},
  state::AppState,
};

fn looks_like_email(s: &str) -> bool {
  let s = s.trim();
  if s.len() < 5 || s.len() > 254 {
    return false;
  }
  let at = match s.find('@') {
    Some(i) => i,
    None => return false,
  };
  at > 0 && at < s.len() - 3 && s.contains('.')
}

fn validate_create(input: &CreateApplication) -> Result<(), axum::response::Response> {
  let first_name = match input.first_name.as_deref() {
    Some(v) => v,
    None => return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response()),
  };
  if !crate::validation::non_empty_trimmed(first_name) || !crate::validation::max_len(first_name, 100) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }

  let last_name = match input.last_name.as_deref() {
    Some(v) => v,
    None => return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response()),
  };
  if !crate::validation::non_empty_trimmed(last_name) || !crate::validation::max_len(last_name, 100) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }

  let email = match input.email.as_deref() {
    Some(v) => v,
    None => return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response()),
  };
  if !looks_like_email(email) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  if !crate::validation::opt_max_len(&input.phone, 50) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  if !crate::validation::opt_url_ok(&input.resume_url) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  if !crate::validation::opt_max_len(&input.cover_letter, 50_000) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  Ok(())
}

fn validate_update(input: &UpdateApplication) -> Result<(), axum::response::Response> {
  if let Some(status) = &input.status {
    if !crate::validation::non_empty_trimmed(status) || !crate::validation::max_len(status, 50) {
      return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
    }
  }
  Ok(())
}

// Public: submit an application
async fn create(State(state): State<AppState>, Json(input): Json<CreateApplication>) -> impl IntoResponse {
  if let Err(resp) = validate_create(&input) {
    return resp;
  }
  match applications::repo::create(&state.db, input).await {
    Ok(item) => (axum::http::StatusCode::CREATED, Json(item)).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "applications create failed");
      AppError::internal().into_response()
    }
  }
}

// Admin: list all applications
async fn list_all(user: AuthUser, State(state): State<AppState>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  match applications::repo::list_all(&state.db).await {
    Ok(items) => Json(items).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "applications list_all failed");
      AppError::internal().into_response()
    }
  }
}

// Admin: update status
async fn update_status(
  user: AuthUser,
  State(state): State<AppState>,
  Path(id): Path<uuid::Uuid>,
  Json(input): Json<UpdateApplication>,
) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  if let Err(resp) = validate_update(&input) {
    return resp;
  }
  match applications::repo::update_status(&state.db, id, input).await {
    Ok(Some(item)) => Json(item).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "applications update failed");
      AppError::internal().into_response()
    }
  }
}

async fn remove(user: AuthUser, State(state): State<AppState>, Path(id): Path<uuid::Uuid>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  match applications::repo::delete(&state.db, id).await {
    Ok(true) => axum::http::StatusCode::NO_CONTENT.into_response(),
    Ok(false) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "applications delete failed");
      AppError::internal().into_response()
    }
  }
}

pub fn router() -> Router<AppState> {
  Router::new()
    .route("/", get(list_all).post(create))
    .route("/{id}", axum::routing::put(update_status).delete(remove))
}
