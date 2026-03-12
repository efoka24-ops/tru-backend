use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct Project {
  pub id: Uuid,
  pub name: String,
  pub client: Option<String>,
  pub description: Option<String>,
  pub category: Option<String>,
  pub status: Option<String>,
  pub technologies: sqlx::types::Json<serde_json::Value>,
  pub details: sqlx::types::Json<serde_json::Value>,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateProject {
  pub name: String,
  pub client: Option<String>,
  pub description: Option<String>,
  pub category: Option<String>,
  pub status: Option<String>,
  pub technologies: Option<serde_json::Value>,
  pub details: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateProject {
  pub name: Option<String>,
  pub client: Option<String>,
  pub description: Option<String>,
  pub category: Option<String>,
  pub status: Option<String>,
  pub technologies: Option<serde_json::Value>,
  pub details: Option<serde_json::Value>,
}
