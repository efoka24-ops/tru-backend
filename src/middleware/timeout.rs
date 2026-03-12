use axum::{
  body::Body,
  http::{Request, StatusCode},
  middleware::Next,
  response::{IntoResponse, Response},
};

pub async fn timeout_middleware(req: Request<Body>, next: Next) -> Response {
  // 10s hard limit per request to avoid resource exhaustion.
  match tokio::time::timeout(std::time::Duration::from_secs(10), next.run(req)).await {
    Ok(resp) => resp,
    Err(_) => (StatusCode::REQUEST_TIMEOUT, "request timeout").into_response(),
  }
}
