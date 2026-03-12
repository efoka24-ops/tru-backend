use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct Job {
  pub id: Uuid,
  pub title: String,
  pub description: Option<String>,
  pub location: Option<String>,
  pub job_type: Option<String>,
  pub salary_range: Option<String>,
  pub published: bool,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateJob {
  pub title: String,
  pub description: Option<String>,
  pub location: Option<String>,
  pub job_type: Option<String>,
  pub salary_range: Option<String>,
  pub published: Option<bool>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateJob {
  pub title: Option<String>,
  pub description: Option<String>,
  pub location: Option<String>,
  pub job_type: Option<String>,
  pub salary_range: Option<String>,
  pub published: Option<bool>,
}
