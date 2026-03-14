use axum::{
  extract::State,
  response::IntoResponse,
  routing::{get, post},
  Json, Router,
};
use serde::{Deserialize, Serialize};

use crate::{
  auth::{jwt, login_code, password, repo},
  middleware::auth::AuthUser,
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

fn validate_password(pw: &str) -> bool {
  let pw = pw.trim();
  pw.len() >= 8 && pw.len() <= 128
}

#[derive(Deserialize)]
struct RegisterRequest {
  email: String,
  name: Option<String>,
  password: String,
}

async fn login_code(State(state): State<AppState>, Json(req): Json<LoginCodeRequest>) -> impl IntoResponse {
  if req.login_code.trim().len() < 6 || req.login_code.trim().len() > 64 {
    return (axum::http::StatusCode::BAD_REQUEST, "invalid login_code").into_response();
  }
  if !validate_password(&req.new_password) {
    return (axum::http::StatusCode::BAD_REQUEST, "invalid password").into_response();
  }

  // Hash the provided code and look up the account
  let code_hash = login_code::hash_login_code(&req.login_code);

  let user = match repo::find_user_by_login_code_hash(&state.db, &code_hash).await {
    Ok(Some(u)) => u,
    Ok(None) => return (axum::http::StatusCode::UNAUTHORIZED, "invalid code").into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "login-code lookup failed");
      return (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "db error").into_response();
    }
  };

  // Expiry check
  if let Some(exp) = user.login_code_expiry {
    if exp < chrono::Utc::now() {
      return (axum::http::StatusCode::UNAUTHORIZED, "code expired").into_response();
    }
  }

  let password_hash = match password::hash_password(&req.new_password) {
    Ok(h) => h,
    Err(_) => return (axum::http::StatusCode::BAD_REQUEST, "invalid password").into_response(),
  };

  let updated = match repo::activate_user_with_password(&state.db, user.id, &password_hash).await {
    Ok(Some(u)) => u,
    Ok(None) => return (axum::http::StatusCode::NOT_FOUND, "user not found").into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "activate failed");
      return (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "db error").into_response();
    }
  };

  let token = match jwt::sign_jwt(updated.id, &updated.role, updated.member_id, &state.jwt_secret) {
    Ok(t) => t,
    Err(err) => {
      tracing::warn!(error = %err, "jwt signing failed");
      return (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "token error").into_response();
    }
  };

  Json(TokenResponse { token }).into_response()
}

#[derive(Deserialize)]
struct LoginRequest {
  email: String,
  password: String,
}

#[derive(Deserialize)]
struct LoginCodeRequest {
  login_code: String,
  new_password: String,
}

#[derive(Serialize)]
struct TokenResponse {
  token: String,
}

#[derive(Serialize)]
struct MeResponse {
  id: uuid::Uuid,
  email: String,
  name: Option<String>,
  role: String,
}

async fn register(State(state): State<AppState>, Json(req): Json<RegisterRequest>) -> impl IntoResponse {
  if !looks_like_email(&req.email) {
    return (axum::http::StatusCode::BAD_REQUEST, "invalid email").into_response();
  }
  if !validate_password(&req.password) {
    return (axum::http::StatusCode::BAD_REQUEST, "invalid password").into_response();
  }

  let password_hash = match password::hash_password(&req.password) {
    Ok(h) => h,
    Err(_) => return (axum::http::StatusCode::BAD_REQUEST, "invalid password").into_response(),
  };

  let user = match repo::create_user(
    &state.db,
    &req.email,
    req.name.as_deref(),
    "member",
    &password_hash,
  )
  .await
  {
    Ok(u) => u,
    Err(err) => {
      tracing::warn!(error = %err, "register failed");
      return (axum::http::StatusCode::CONFLICT, "email already exists").into_response();
    }
  };

  let token = match jwt::sign_jwt(user.id, &user.role, user.member_id, &state.jwt_secret) {
    Ok(t) => t,
    Err(err) => {
      tracing::warn!(error = %err, "jwt signing failed");
      return (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "token error").into_response();
    }
  };

  Json(TokenResponse { token }).into_response()
}

async fn login(State(state): State<AppState>, Json(req): Json<LoginRequest>) -> impl IntoResponse {
  if !looks_like_email(&req.email) {
    return (axum::http::StatusCode::BAD_REQUEST, "invalid email").into_response();
  }
  if !validate_password(&req.password) {
    return (axum::http::StatusCode::BAD_REQUEST, "invalid password").into_response();
  }

  let user = match repo::find_user_by_email(&state.db, &req.email).await {
    Ok(Some(u)) => u,
    Ok(None) => return (axum::http::StatusCode::UNAUTHORIZED, "invalid credentials").into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "login failed");
      return (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "db error").into_response();
    }
  };

  if user.status != "active" {
    return (axum::http::StatusCode::FORBIDDEN, "account inactive").into_response();
  }

  let ok = match password::verify_password(&req.password, &user.password_hash) {
    Ok(v) => v,
    Err(_) => false,
  };

  if !ok {
    return (axum::http::StatusCode::UNAUTHORIZED, "invalid credentials").into_response();
  }

  let _ = repo::update_last_login(&state.db, user.id).await;

  let token = match jwt::sign_jwt(user.id, &user.role, user.member_id, &state.jwt_secret) {
    Ok(t) => t,
    Err(err) => {
      tracing::warn!(error = %err, "jwt signing failed");
      return (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "token error").into_response();
    }
  };

  Json(TokenResponse { token }).into_response()
}

async fn me(user: AuthUser, State(state): State<AppState>) -> impl IntoResponse {
  let u = match repo::find_user_by_id(&state.db, user.user_id).await {
    Ok(Some(u)) => u,
    Ok(None) => return (axum::http::StatusCode::NOT_FOUND, "user not found").into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "me failed");
      return (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "db error").into_response();
    }
  };

  Json(MeResponse {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
  })
  .into_response()
}

pub fn router() -> Router<AppState> {
  Router::new()
    .route("/register", post(register))
    .route("/login", post(login))
    .route("/login-code", post(login_code))
    .route("/me", get(me))
}
