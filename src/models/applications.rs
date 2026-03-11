use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct Application {
  pub id: Uuid,
  pub job_id: Option<Uuid>,
  pub first_name: Option<String>,
  pub last_name: Option<String>,
  pub email: Option<String>,
  pub phone: Option<String>,
  pub resume_url: Option<String>,
  pub cover_letter: Option<String>,
  pub status: String,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateApplication {
  pub job_id: Option<Uuid>,
  pub first_name: Option<String>,
  pub last_name: Option<String>,
  pub email: Option<String>,
  pub phone: Option<String>,
  pub resume_url: Option<String>,
  pub cover_letter: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateApplication {
  pub status: Option<String>,
}
