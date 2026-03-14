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

fn validate_create(input: &formations::CreateFormation) -> Result<(), AppError> {
  if !crate::validation::non_empty_trimmed(&input.titre) || !crate::validation::max_len(&input.titre, 255) {
    return Err(AppError::bad_request());
  }
  if !crate::validation::opt_max_len(&input.description, 50_000) {
    return Err(AppError::bad_request());
  }
  if !crate::validation::non_empty_trimmed(&input.duree) || !crate::validation::max_len(&input.duree, 100) {
    return Err(AppError::bad_request());
  }
  if !crate::validation::non_empty_trimmed(&input.format) || !crate::validation::max_len(&input.format, 100) {
    return Err(AppError::bad_request());
  }
  if !crate::validation::opt_max_len(&input.lieu, 200) {
    return Err(AppError::bad_request());
  }
  if !crate::validation::json_opt_max_bytes(&input.modules, 100_000) {
    return Err(AppError::bad_request());
  }
  if !crate::validation::opt_url_ok(&input.image_url) {
    return Err(AppError::bad_request());
  }
  if let Some(p) = input.places_disponibles {
    if p < 0 || p > 100_000 {
      return Err(AppError::bad_request());
    }
  }
  if !crate::validation::opt_max_len(&input.statut, 50) {
    return Err(AppError::bad_request());
  }
  Ok(())
}

fn validate_update(input: &formations::UpdateFormation) -> Result<(), AppError> {
  if let Some(titre) = &input.titre {
    if !crate::validation::non_empty_trimmed(titre) || !crate::validation::max_len(titre, 255) {
      return Err(AppError::bad_request());
    }
  }
  if !crate::validation::opt_max_len(&input.description, 50_000) {
    return Err(AppError::bad_request());
  }
  if let Some(duree) = &input.duree {
    if !crate::validation::non_empty_trimmed(duree) || !crate::validation::max_len(duree, 100) {
      return Err(AppError::bad_request());
    }
  }
  if let Some(format) = &input.format {
    if !crate::validation::non_empty_trimmed(format) || !crate::validation::max_len(format, 100) {
      return Err(AppError::bad_request());
    }
  }
  if !crate::validation::opt_max_len(&input.lieu, 200) {
    return Err(AppError::bad_request());
  }
  if !crate::validation::json_opt_max_bytes(&input.modules, 100_000) {
    return Err(AppError::bad_request());
  }
  if !crate::validation::opt_url_ok(&input.image_url) {
    return Err(AppError::bad_request());
  }
  if let Some(p) = input.places_disponibles {
    if p < 0 || p > 100_000 {
      return Err(AppError::bad_request());
    }
  }
  if !crate::validation::opt_max_len(&input.statut, 50) {
    return Err(AppError::bad_request());
  }
  Ok(())
}

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
  if let Err(err) = validate_create(&input) {
    return err.into_response();
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
  if let Err(err) = validate_update(&input) {
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
