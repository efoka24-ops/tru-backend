use axum::{
  extract::{Path, State},
  response::IntoResponse,
  routing::get,
  Json, Router,
};

use crate::{
  error::AppError,
  contacts,
  middleware::auth::{require_admin, AuthUser},
  models::contacts::{CreateContact, UpdateContact},
  state::AppState,
};

#[derive(serde::Deserialize)]
struct ReplyBody {
  id: uuid::Uuid,
  #[allow(dead_code)]
  reponse: Option<String>,
}

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

fn validate_create(input: &CreateContact) -> Result<(), axum::response::Response> {
  let name = match input.name.as_deref() {
    Some(v) => v,
    None => return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response()),
  };
  if !crate::validation::non_empty_trimmed(name) || !crate::validation::max_len(name, 200) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }

  let email = match input.email.as_deref() {
    Some(v) => v,
    None => return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response()),
  };
  if !looks_like_email(email) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }

  let message = match input.message.as_deref() {
    Some(v) => v,
    None => return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response()),
  };
  if !crate::validation::non_empty_trimmed(message) || !crate::validation::max_len(message, 10_000) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }

  if !crate::validation::opt_max_len(&input.phone, 50) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  if !crate::validation::opt_max_len(&input.subject, 200) {
    return Err((axum::http::StatusCode::BAD_REQUEST, "invalid input").into_response());
  }
  Ok(())
}

async fn create(State(state): State<AppState>, Json(input): Json<CreateContact>) -> impl IntoResponse {
  if let Err(resp) = validate_create(&input) {
    return resp;
  }
  match contacts::repo::create(&state.db, input).await {
    Ok(item) => (axum::http::StatusCode::CREATED, Json(item)).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "contacts create failed");
      AppError::internal().into_response()
    }
  }
}

async fn list_all(user: AuthUser, State(state): State<AppState>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  match contacts::repo::list_all(&state.db).await {
    Ok(items) => Json(items).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "contacts list_all failed");
      AppError::internal().into_response()
    }
  }
}

async fn update(
  user: AuthUser,
  State(state): State<AppState>,
  Path(id): Path<uuid::Uuid>,
  Json(input): Json<UpdateContact>,
) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  match contacts::repo::update(&state.db, id, input).await {
    Ok(Some(item)) => Json(item).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "contacts update failed");
      AppError::internal().into_response()
    }
  }
}

async fn remove(
  user: AuthUser,
  State(state): State<AppState>,
  Path(id): Path<uuid::Uuid>,
) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  match contacts::repo::delete(&state.db, id).await {
    Ok(true) => axum::http::StatusCode::NO_CONTENT.into_response(),
    Ok(false) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "contacts delete failed");
      AppError::internal().into_response()
    }
  }
}

async fn reply(
  user: AuthUser,
  State(state): State<AppState>,
  Json(body): Json<ReplyBody>,
) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  let input = UpdateContact { read: Some(true) };
  match contacts::repo::update(&state.db, body.id, input).await {
    Ok(Some(item)) => Json(item).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "contacts reply failed");
      AppError::internal().into_response()
    }
  }
}

pub fn router() -> Router<AppState> {
  Router::new()
    .route("/", get(list_all).post(create))
    .route("/reply", axum::routing::post(reply))
    .route("/{id}", axum::routing::put(update).delete(remove))
}
