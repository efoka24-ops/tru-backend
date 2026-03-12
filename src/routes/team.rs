use axum::{
  extract::{Path, State},
  response::IntoResponse,
  routing::get,
  Json, Router,
};

use crate::{
  error::AppError,
  middleware::auth::{require_admin, AuthUser},
  models::team::{CreateTeamMember, UpdateTeamMember},
  state::AppState,
  team,
};

fn validate_create(input: &CreateTeamMember) -> Result<(), axum::response::Response> {
  if !crate::validation::non_empty_trimmed(&input.name) || !crate::validation::max_len(&input.name, 200) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  if !crate::validation::opt_max_len(&input.title, 200)
    || !crate::validation::opt_max_len(&input.role, 200)
    || !crate::validation::opt_max_len(&input.email, 254)
    || !crate::validation::opt_max_len(&input.phone, 50)
  {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  if !crate::validation::opt_max_len(&input.description, 5000) || !crate::validation::opt_max_len(&input.bio, 20_000) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  if !crate::validation::opt_url_ok(&input.image_url) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  if let Some(v) = &input.social_links {
    if !crate::validation::json_max_bytes(v, 10_000) {
      return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
    }
  }
  Ok(())
}

fn validate_update(input: &UpdateTeamMember) -> Result<(), axum::response::Response> {
  if let Some(name) = &input.name {
    if !crate::validation::non_empty_trimmed(name) || !crate::validation::max_len(name, 200) {
      return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
    }
  }
  if !crate::validation::opt_max_len(&input.title, 200)
    || !crate::validation::opt_max_len(&input.role, 200)
    || !crate::validation::opt_max_len(&input.email, 254)
    || !crate::validation::opt_max_len(&input.phone, 50)
  {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  if !crate::validation::opt_max_len(&input.description, 5000) || !crate::validation::opt_max_len(&input.bio, 20_000) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  if !crate::validation::opt_url_ok(&input.image_url) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  if let Some(v) = &input.social_links {
    if !crate::validation::json_max_bytes(v, 10_000) {
      return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
    }
  }
  Ok(())
}

async fn list(State(state): State<AppState>) -> impl IntoResponse {
  match team::repo::list_visible(&state.db).await {
    Ok(items) => Json(items).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "team list failed");
      (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "db error").into_response()
    }
  }
}

async fn get_by_id(State(state): State<AppState>, Path(id): Path<uuid::Uuid>) -> impl IntoResponse {
  match team::repo::get_by_id(&state.db, id).await {
    Ok(Some(item)) => Json(item).into_response(),
    Ok(None) => (axum::http::StatusCode::NOT_FOUND, "not found").into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "team get failed");
      (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "db error").into_response()
    }
  }
}

async fn create(
  user: AuthUser,
  State(state): State<AppState>,
  Json(input): Json<CreateTeamMember>,
) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }

  if let Err(resp) = validate_create(&input) {
    return resp;
  }

  match team::repo::create(&state.db, input).await {
    Ok(item) => (axum::http::StatusCode::CREATED, Json(item)).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "team create failed");
      (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "db error").into_response()
    }
  }
}

async fn update(
  user: AuthUser,
  State(state): State<AppState>,
  Path(id): Path<uuid::Uuid>,
  Json(input): Json<UpdateTeamMember>,
) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }

  if let Err(resp) = validate_update(&input) {
    return resp;
  }

  match team::repo::update(&state.db, id, input).await {
    Ok(Some(item)) => Json(item).into_response(),
    Ok(None) => (axum::http::StatusCode::NOT_FOUND, "not found").into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "team update failed");
      (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "db error").into_response()
    }
  }
}

async fn remove(user: AuthUser, State(state): State<AppState>, Path(id): Path<uuid::Uuid>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }

  match team::repo::delete(&state.db, id).await {
    Ok(true) => axum::http::StatusCode::NO_CONTENT.into_response(),
    Ok(false) => (axum::http::StatusCode::NOT_FOUND, "not found").into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "team delete failed");
      (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "db error").into_response()
    }
  }
}

pub fn router() -> Router<AppState> {
  Router::new()
    .route("/", get(list).post(create))
    .route("/{id}", get(get_by_id).put(update).delete(remove))
}
