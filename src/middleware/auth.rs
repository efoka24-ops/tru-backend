use axum::{
  extract::FromRequestParts,
  http::{request::Parts, HeaderMap, StatusCode},
  response::{IntoResponse, Response},
};

use crate::{auth::jwt, error::AppError, state::AppState};

#[derive(Debug, Clone)]
pub struct AuthUser {
  pub user_id: uuid::Uuid,
  pub email: String,
  pub role: String,
  pub member_id: Option<uuid::Uuid>,
}

fn bearer_token(headers: &HeaderMap) -> Option<&str> {
  let auth = headers.get(axum::http::header::AUTHORIZATION)?.to_str().ok()?;
  auth.strip_prefix("Bearer ")
}

impl FromRequestParts<AppState> for AuthUser {
  type Rejection = Response;

  fn from_request_parts(
    parts: &mut Parts,
    state: &AppState,
  ) -> impl std::future::Future<Output = Result<Self, Self::Rejection>> + Send {
    // Extract what we need without holding references across await
    let token = bearer_token(&parts.headers).map(|s| s.to_string());
    let secret = state.jwt_secret.clone();

    Box::pin(async move {
      let token = token.ok_or((StatusCode::UNAUTHORIZED, "missing bearer token").into_response())?;

      let claims = jwt::verify_jwt(&token, &secret)
        .map_err(|_| (StatusCode::UNAUTHORIZED, "invalid token").into_response())?;

      Ok(AuthUser {
        user_id: claims.sub,
        email: claims.email,
        role: claims.role,
        member_id: claims.member_id,
      })
    })
  }
}

pub fn require_admin(user: &AuthUser) -> Result<(), AppError> {
  if user.role == "admin" {
    Ok(())
  } else {
    Err(AppError::forbidden())
  }
}

pub fn require_own_profile_or_admin(user: &AuthUser, member_id: uuid::Uuid) -> Result<(), AppError> {
  if user.role == "admin" {
    return Ok(());
  }

  match user.member_id {
    Some(id) if id == member_id => Ok(()),
    _ => Err(AppError::forbidden()),
  }
}
