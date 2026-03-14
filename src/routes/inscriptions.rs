use axum::{
  extract::{Path, State},
  response::IntoResponse,
  routing::get,
  Json, Router,
};

use crate::{
  error::AppError,
  inscriptions,
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

// Admin: list all inscriptions
async fn list_all(user: AuthUser, State(state): State<AppState>) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  match inscriptions::repo::list_all(&state.db).await {
    Ok(items) => Json(items).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "inscriptions list failed");
      AppError::internal().into_response()
    }
  }
}

// Public: lookup by numero_inscription
async fn get_by_numero(
  State(state): State<AppState>,
  Path(numero): Path<String>,
) -> impl IntoResponse {
  let numero = numero.trim().to_string();
  if numero.is_empty() || numero.len() > 50 {
    return AppError::bad_request().into_response();
  }
  match inscriptions::repo::get_by_numero(&state.db, &numero).await {
    Ok(Some(item)) => Json(item).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "inscriptions get_by_numero failed");
      AppError::internal().into_response()
    }
  }
}

// Public: submit a registration
async fn create(
  State(state): State<AppState>,
  Json(input): Json<inscriptions::CreateInscription>,
) -> impl IntoResponse {
  if input.nom.trim().is_empty()
    || input.prenom.trim().is_empty()
    || !looks_like_email(&input.email)
    || input.telephone.trim().is_empty()
  {
    return AppError::bad_request().into_response();
  }
  if input.nom.len() > 255
    || input.prenom.len() > 255
    || input.email.len() > 255
    || input.telephone.len() > 50
  {
    return AppError::bad_request().into_response();
  }
  if !crate::validation::opt_max_len(&input.profession, 255)
    || !crate::validation::opt_max_len(&input.entreprise, 255)
    || !crate::validation::opt_max_len(&input.notes, 20_000)
  {
    return AppError::bad_request().into_response();
  }
  match inscriptions::repo::create(&state.db, input).await {
    Ok(item) => (axum::http::StatusCode::CREATED, Json(item)).into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "inscriptions create failed");
      AppError::internal().into_response()
    }
  }
}

// Admin: confirm inscription (can also be done by front-end via confirmer route)
async fn confirmer(
  State(state): State<AppState>,
  Json(input): Json<inscriptions::ConfirmerInscription>,
) -> impl IntoResponse {
  if input.numero_inscription.trim().is_empty() || input.numero_inscription.len() > 50 {
    return AppError::bad_request().into_response();
  }
  match inscriptions::repo::confirmer(&state.db, input).await {
    Ok(Some(item)) => Json(item).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "inscriptions confirmer failed");
      AppError::internal().into_response()
    }
  }
}

// Admin: update inscription
async fn update(
  user: AuthUser,
  State(state): State<AppState>,
  Path(id): Path<i64>,
  Json(input): Json<inscriptions::UpdateInscription>,
) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  if id <= 0 {
    return AppError::bad_request().into_response();
  }
  if !crate::validation::opt_max_len(&input.statut, 50) || !crate::validation::opt_max_len(&input.notes, 20_000) {
    return AppError::bad_request().into_response();
  }
  match inscriptions::repo::update(&state.db, id, input).await {
    Ok(Some(item)) => Json(item).into_response(),
    Ok(None) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "inscriptions update failed");
      AppError::internal().into_response()
    }
  }
}

// Admin: delete inscription
async fn remove(
  user: AuthUser,
  State(state): State<AppState>,
  Path(id): Path<i64>,
) -> impl IntoResponse {
  if let Err(err) = require_admin(&user) {
    return err.into_response();
  }
  if id <= 0 {
    return AppError::bad_request().into_response();
  }
  match inscriptions::repo::delete(&state.db, id).await {
    Ok(true) => axum::http::StatusCode::NO_CONTENT.into_response(),
    Ok(false) => AppError::not_found().into_response(),
    Err(err) => {
      tracing::warn!(error = %err, "inscriptions delete failed");
      AppError::internal().into_response()
    }
  }
}

pub fn router() -> Router<AppState> {
  Router::new()
    .route("/", get(list_all).post(create))
    .route("/numero/{numero}", get(get_by_numero))
    .route("/confirmer", axum::routing::post(confirmer))
    .route("/{id}", axum::routing::put(update).delete(remove))
}
