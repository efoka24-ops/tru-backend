use axum::{
  http::StatusCode,
  response::{IntoResponse, Response},
  Json,
};
use serde::Serialize;

#[derive(Debug, Clone, Copy)]
pub struct AppError {
  pub status: StatusCode,
  pub code: &'static str,
}

#[derive(Debug, Serialize)]
struct ErrorResponse {
  error: &'static str,
}

impl AppError {
  pub fn bad_request() -> Self {
    Self {
      status: StatusCode::BAD_REQUEST,
      code: "bad_request",
    }
  }

  pub fn conflict() -> Self {
    Self {
      status: StatusCode::CONFLICT,
      code: "conflict",
    }
  }

  pub fn unauthorized() -> Self {
    Self {
      status: StatusCode::UNAUTHORIZED,
      code: "unauthorized",
    }
  }

  pub fn forbidden() -> Self {
    Self {
      status: StatusCode::FORBIDDEN,
      code: "forbidden",
    }
  }

  pub fn not_found() -> Self {
    Self {
      status: StatusCode::NOT_FOUND,
      code: "not_found",
    }
  }

  pub fn payload_too_large() -> Self {
    Self {
      status: StatusCode::PAYLOAD_TOO_LARGE,
      code: "payload_too_large",
    }
  }

  pub fn internal() -> Self {
    Self {
      status: StatusCode::INTERNAL_SERVER_ERROR,
      code: "internal_error",
    }
  }
}

impl IntoResponse for AppError {
  fn into_response(self) -> Response {
    (self.status, Json(ErrorResponse { error: self.code })).into_response()
  }
}

impl From<sqlx::Error> for AppError {
  fn from(_: sqlx::Error) -> Self {
    AppError::internal()
  }
}
