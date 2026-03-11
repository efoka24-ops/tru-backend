use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct Service {
  pub id: Uuid,
  pub icon: Option<String>,
  pub title: String,
  pub description: Option<String>,
  pub features: sqlx::types::Json<serde_json::Value>,
  pub objective: Option<String>,
  pub color: Option<String>,
  pub image_url: Option<String>,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateService {
  pub icon: Option<String>,
  pub title: String,
  pub description: Option<String>,
  pub features: Option<serde_json::Value>,
  pub objective: Option<String>,
  pub color: Option<String>,
  pub image_url: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateService {
  pub icon: Option<String>,
  pub title: Option<String>,
  pub description: Option<String>,
  pub features: Option<serde_json::Value>,
  pub objective: Option<String>,
  pub color: Option<String>,
  pub image_url: Option<String>,
}
