use axum::{
  extract::{Path, State},
  response::IntoResponse,
  routing::{get, post},
  Json, Router,
};
use rand::{distributions::Alphanumeric, Rng};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
  auth::login_code,
  error::AppError,
  middleware::auth::{require_admin, AuthUser},
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

#[derive(Debug, Deserialize)]
struct CreateAccountRequest {
  email: String,
  role: Option<String>,
}

#[derive(Debug, Serialize)]
struct CreateAccountResponse {
  user_id: Uuid,
  member_id: Uuid,
  email: String,
  role: String,
  status: String,
  login_code: String,
  login_code_expiry: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Deserialize)]
struct UpdateAccountRequest {
  email: Option<String>,
  role: Option<String>,
  status: Option<String>,
}

#[derive(Debug, Serialize)]
struct LoginCodeResponse {
  member_id: Uuid,
  login_code: String,
  login_code_expiry: chrono::DateTime<chrono::Utc>,
}

async fn list_members(user: AuthUser, State(state): State<AppState>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }

  match crate::admin_members::repo::list_members_with_accounts(&state.db).await {
    Ok(rows) => Json(rows).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "list_members_with_accounts failed");
      AppError::internal().into_response()
    }
  }
}

fn gen_login_code() -> String {
  // URL-safe, short lived, returned only once.
  rand::thread_rng()
    .sample_iter(&Alphanumeric)
    .take(10)
    .map(char::from)
    .collect()
}

async fn create_account(
  user: AuthUser,
  Path(member_id): Path<Uuid>,
  State(state): State<AppState>,
  Json(req): Json<CreateAccountRequest>,
) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }

  if !looks_like_email(&req.email) {
    return AppError::bad_request().into_response();
  }

  let role = req.role.unwrap_or_else(|| "member".to_string());
  if role != "admin" && role != "member" {
    return AppError::bad_request().into_response();
  }

  let login_code_plain = gen_login_code();
  let login_code_hash = login_code::hash_login_code(&login_code_plain);
  let expiry = crate::admin_members::repo::default_login_code_expiry();

  if let Err(err) = crate::admin_members::repo::update_member_email(&state.db, member_id, &req.email).await {
    tracing::warn!(error = %err, "update_member_email failed");
  }

  match crate::admin_members::repo::create_account_for_member(
    &state.db,
    member_id,
    &req.email,
    None,
    &role,
    &login_code_hash,
    expiry,
  )
  .await
  {
    Ok(u) => Json(CreateAccountResponse {
      user_id: u.id,
      member_id,
      email: u.email,
      role: u.role,
      status: u.status,
      login_code: login_code_plain,
      login_code_expiry: expiry,
    })
    .into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "create_account_for_member failed");
      AppError::conflict().into_response()
    }
  }
}

async fn regen_login_code(
  user: AuthUser,
  Path(member_id): Path<Uuid>,
  State(state): State<AppState>,
) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }

  let login_code_plain = gen_login_code();
  let login_code_hash = login_code::hash_login_code(&login_code_plain);
  let expiry = crate::admin_members::repo::default_login_code_expiry();

  match crate::admin_members::repo::regenerate_login_code(&state.db, member_id, &login_code_hash, expiry).await {
    Ok(Some(_)) => Json(LoginCodeResponse {
      member_id,
      login_code: login_code_plain,
      login_code_expiry: expiry,
    })
    .into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "regenerate_login_code failed");
      AppError::internal().into_response()
    }
  }
}

async fn update_account(
  user: AuthUser,
  Path(member_id): Path<Uuid>,
  State(state): State<AppState>,
  Json(req): Json<UpdateAccountRequest>,
) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }

  if let Some(role) = &req.role {
    if role != "admin" && role != "member" {
      return AppError::bad_request().into_response();
    }
  }

  if let Some(status) = &req.status {
    if status != "active" && status != "pending" && status != "inactive" {
      return AppError::bad_request().into_response();
    }
  }

  if let Some(email) = &req.email {
    if !looks_like_email(email) {
      return AppError::bad_request().into_response();
    }
  }

  if let Some(email) = &req.email {
    let _ = crate::admin_members::repo::update_member_email(&state.db, member_id, email).await;
  }

  match crate::admin_members::repo::update_account(
    &state.db,
    member_id,
    req.email.as_deref(),
    req.role.as_deref(),
    req.status.as_deref(),
  )
  .await
  {
    Ok(Some(u)) => Json(u).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "update_account failed");
      AppError::internal().into_response()
    }
  }
}

async fn delete_account(
  user: AuthUser,
  Path(member_id): Path<Uuid>,
  State(state): State<AppState>,
) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }

  match crate::admin_members::repo::delete_account(&state.db, member_id).await {
    Ok(true) => axum::http::StatusCode::NO_CONTENT.into_response(),
    Ok(false) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "delete_account failed");
      AppError::internal().into_response()
    }
  }
}

async fn test_team(user: AuthUser, State(state): State<AppState>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }

  match crate::admin_members::repo::list_members_with_accounts(&state.db).await {
    Ok(rows) => Json(serde_json::json!({"count": rows.len(), "rows": rows})).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "test_team failed");
      AppError::internal().into_response()
    }
  }
}

pub fn router() -> Router<AppState> {
  Router::new()
    .route("/members", get(list_members))
    .route("/members/{id}/account", post(create_account).put(update_account).delete(delete_account))
    .route("/members/{id}/login-code", post(regen_login_code))
    .route("/test/team", get(test_team))
}
