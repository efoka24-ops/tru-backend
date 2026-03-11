use axum::{
  extract::{Path, State},
  response::IntoResponse,
  routing::get,
  Json, Router,
};

use crate::{
  error::AppError,
  middleware::auth::{require_admin, AuthUser},
  models::news::{CreateNewsItem, UpdateNewsItem},
  news,
  state::AppState,
};

fn validate_create(input: &CreateNewsItem) -> Result<(), AppError> {
  if !crate::validation::non_empty_trimmed(&input.title) || !crate::validation::max_len(&input.title, 200) {
    return Err(AppError::bad_request());
  }
  let content = match input.content.as_deref() {
    Some(v) => v,
    None => return Err(AppError::bad_request()),
  };
  if !crate::validation::non_empty_trimmed(content) || !crate::validation::max_len(content, 50_000) {
    return Err(AppError::bad_request());
  }
  if !crate::validation::opt_max_len(&input.excerpt, 500) {
    return Err(AppError::bad_request());
  }
  if !crate::validation::opt_max_len(&input.image_url, 2048) {
    return Err(AppError::bad_request());
  }
  if !crate::validation::opt_url_ok(&input.image_url) {
    return Err(AppError::bad_request());
  }
  Ok(())
}

fn validate_update(input: &UpdateNewsItem) -> Result<(), AppError> {
  if let Some(title) = &input.title {
    if !crate::validation::non_empty_trimmed(title) || !crate::validation::max_len(title, 200) {
      return Err(AppError::bad_request());
    }
  }
  if let Some(content) = &input.content {
    if !crate::validation::non_empty_trimmed(content) || !crate::validation::max_len(content, 50_000) {
      return Err(AppError::bad_request());
    }
  }
  if !crate::validation::opt_max_len(&input.excerpt, 500) {
    return Err(AppError::bad_request());
  }
  if !crate::validation::opt_url_ok(&input.image_url) {
    return Err(AppError::bad_request());
  }
  Ok(())
}

async fn list(State(state): State<AppState>) -> impl IntoResponse {
  match news::repo::list_published(&state.db).await {
    Ok(items) => Json(items).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "news list failed");
      AppError::internal().into_response()
    }
  }
}

async fn list_all(user: AuthUser, State(state): State<AppState>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  match news::repo::list_all(&state.db).await {
    Ok(items) => Json(items).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "news list_all failed");
      AppError::internal().into_response()
    }
  }
}

async fn get_by_id(State(state): State<AppState>, Path(id): Path<uuid::Uuid>) -> impl IntoResponse {
  match news::repo::get_by_id(&state.db, id).await {
    Ok(Some(item)) => Json(item).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "news get failed");
      AppError::internal().into_response()
    }
  }
}

async fn create(user: AuthUser, State(state): State<AppState>, Json(input): Json<CreateNewsItem>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  if let Err(resp) = validate_create(&input) {
    return resp.into_response();
  }
  match news::repo::create(&state.db, input).await {
    Ok(item) => (axum::http::StatusCode::CREATED, Json(item)).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "news create failed");
      AppError::internal().into_response()
    }
  }
}

async fn update(user: AuthUser, State(state): State<AppState>, Path(id): Path<uuid::Uuid>, Json(input): Json<UpdateNewsItem>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  if let Err(resp) = validate_update(&input) {
    return resp.into_response();
  }
  match news::repo::update(&state.db, id, input).await {
    Ok(Some(item)) => Json(item).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "news update failed");
      AppError::internal().into_response()
    }
  }
}

async fn remove(user: AuthUser, State(state): State<AppState>, Path(id): Path<uuid::Uuid>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  match news::repo::delete(&state.db, id).await {
    Ok(true) => axum::http::StatusCode::NO_CONTENT.into_response(),
    Ok(false) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "news delete failed");
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
