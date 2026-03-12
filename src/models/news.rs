use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct NewsItem {
  pub id: Uuid,
  pub title: String,
  pub content: Option<String>,
  pub excerpt: Option<String>,
  pub image_url: Option<String>,
  pub published: bool,
  pub published_at: Option<DateTime<Utc>>,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateNewsItem {
  pub title: String,
  pub content: Option<String>,
  pub excerpt: Option<String>,
  pub image_url: Option<String>,
  pub published: Option<bool>,
  pub published_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateNewsItem {
  pub title: Option<String>,
  pub content: Option<String>,
  pub excerpt: Option<String>,
  pub image_url: Option<String>,
  pub published: Option<bool>,
  pub published_at: Option<DateTime<Utc>>,
}
