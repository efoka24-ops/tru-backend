use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct Solution {
  pub id: Uuid,
  pub title: String,
  pub description: Option<String>,
  pub icon: Option<String>,
  pub image_url: Option<String>,
  pub details: sqlx::types::Json<serde_json::Value>,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateSolution {
  pub title: String,
  pub description: Option<String>,
  pub icon: Option<String>,
  pub image_url: Option<String>,
  pub details: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateSolution {
  pub title: Option<String>,
  pub description: Option<String>,
  pub icon: Option<String>,
  pub image_url: Option<String>,
  pub details: Option<serde_json::Value>,
}
