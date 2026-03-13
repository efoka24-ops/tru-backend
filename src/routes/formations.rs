use axum::{
  extract::{Path, State},
  response::IntoResponse,
  routing::get,
  Json, Router,
};

use crate::{
  error::AppError,
  formations,
  middleware::auth::{require_admin, AuthUser},
  state::AppState,
};

async fn list(State(state): State<AppState>) -> impl IntoResponse {
  match formations::repo::list_active(&state.db).await {
    Ok(items) => Json(items).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "formations list failed");
      AppError::internal().into_response()
    }
  }
}

async fn list_all(user: AuthUser, State(state): State<AppState>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  match formations::repo::list(&state.db).await {
    Ok(items) => Json(items).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "formations list_all failed");
      AppError::internal().into_response()
    }
  }
}

async fn get_by_id(State(state): State<AppState>, Path(id): Path<i64>) -> impl IntoResponse {
  match formations::repo::get_by_id(&state.db, id).await {
    Ok(Some(item)) => Json(item).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "formations get failed");
      AppError::internal().into_response()
    }
  }
}

async fn create(
  user: AuthUser,
  State(state): State<AppState>,
  Json(input): Json<formations::CreateFormation>,
) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  if input.titre.trim().is_empty() || input.titre.len() > 255 {
    return AppError::bad_request().into_response();
  }
  match formations::repo::create(&state.db, input).await {
    Ok(item) => (axum::http::StatusCode::CREATED, Json(item)).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "formations create failed");
      AppError::internal().into_response()
    }
  }
}

async fn update(
  user: AuthUser,
  State(state): State<AppState>,
  Path(id): Path<i64>,
  Json(input): Json<formations::UpdateFormation>,
) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  match formations::repo::update(&state.db, id, input).await {
    Ok(Some(item)) => Json(item).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "formations update failed");
      AppError::internal().into_response()
    }
  }
}

async fn remove(
  user: AuthUser,
  State(state): State<AppState>,
  Path(id): Path<i64>,
) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  match formations::repo::delete(&state.db, id).await {
    Ok(true) => axum::http::StatusCode::NO_CONTENT.into_response(),
    Ok(false) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "formations delete failed");
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
