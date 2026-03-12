use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct Contact {
  pub id: Uuid,
  pub name: Option<String>,
  pub email: Option<String>,
  pub phone: Option<String>,
  pub subject: Option<String>,
  pub message: Option<String>,
  pub read: bool,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateContact {
  pub name: Option<String>,
  pub email: Option<String>,
  pub phone: Option<String>,
  pub subject: Option<String>,
  pub message: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateContact {
  pub read: Option<bool>,
}
