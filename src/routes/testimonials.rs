use axum::{
  extract::{Path, State},
  response::IntoResponse,
  routing::get,
  Json, Router,
};

use crate::{
  error::AppError,
  middleware::auth::{require_admin, AuthUser},
  models::testimonials::{CreateTestimonial, UpdateTestimonial},
  state::AppState,
  testimonials,
};

fn validate_create(input: &CreateTestimonial) -> Result<(), axum::response::Response> {
  if !crate::validation::non_empty_trimmed(&input.name) || !crate::validation::max_len(&input.name, 200) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  let message = match input.message.as_deref() {
    Some(v) => v,
    None => return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response()),
  };
  if !crate::validation::non_empty_trimmed(message) || !crate::validation::max_len(message, 5000) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  if let Some(r) = input.rating {
    if r < 1 || r > 5 {
      return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
    }
  }
  if !crate::validation::opt_max_len(&input.title, 200) || !crate::validation::opt_max_len(&input.company, 200) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  if !crate::validation::opt_url_ok(&input.image_url) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  Ok(())
}

fn validate_update(input: &UpdateTestimonial) -> Result<(), axum::response::Response> {
  if let Some(name) = &input.name {
    if !crate::validation::non_empty_trimmed(name) || !crate::validation::max_len(name, 200) {
      return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
    }
  }
  if let Some(message) = input.message.as_deref() {
    if !crate::validation::non_empty_trimmed(message) || !crate::validation::max_len(message, 5000) {
      return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
    }
  }
  if let Some(r) = input.rating {
    if r < 1 || r > 5 {
      return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
    }
  }
  if !crate::validation::opt_max_len(&input.title, 200) || !crate::validation::opt_max_len(&input.company, 200) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  if !crate::validation::opt_url_ok(&input.image_url) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  Ok(())
}

async fn list(State(state): State<AppState>) -> impl IntoResponse {
  match testimonials::repo::list_published(&state.db).await {
    Ok(items) => Json(items).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "testimonials list failed");
      AppError::internal().into_response()
    }
  }
}

async fn list_all(user: AuthUser, State(state): State<AppState>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  match testimonials::repo::list_all(&state.db).await {
    Ok(items) => Json(items).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "testimonials list_all failed");
      AppError::internal().into_response()
    }
  }
}

async fn get_by_id(State(state): State<AppState>, Path(id): Path<uuid::Uuid>) -> impl IntoResponse {
  match testimonials::repo::get_by_id(&state.db, id).await {
    Ok(Some(item)) => Json(item).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "testimonials get failed");
      AppError::internal().into_response()
    }
  }
}

async fn create(user: AuthUser, State(state): State<AppState>, Json(input): Json<CreateTestimonial>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  if let Err(resp) = validate_create(&input) {
    return resp;
  }
  match testimonials::repo::create(&state.db, input).await {
    Ok(item) => (axum::http::StatusCode::CREATED, Json(item)).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "testimonials create failed");
      AppError::internal().into_response()
    }
  }
}

async fn update(user: AuthUser, State(state): State<AppState>, Path(id): Path<uuid::Uuid>, Json(input): Json<UpdateTestimonial>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  if let Err(resp) = validate_update(&input) {
    return resp;
  }
  match testimonials::repo::update(&state.db, id, input).await {
    Ok(Some(item)) => Json(item).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "testimonials update failed");
      AppError::internal().into_response()
    }
  }
}

async fn remove(user: AuthUser, State(state): State<AppState>, Path(id): Path<uuid::Uuid>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  match testimonials::repo::delete(&state.db, id).await {
    Ok(true) => axum::http::StatusCode::NO_CONTENT.into_response(),
    Ok(false) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "testimonials delete failed");
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
