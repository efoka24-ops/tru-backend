use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct Testimonial {
  pub id: Uuid,
  pub name: String,
  pub title: Option<String>,
  pub company: Option<String>,
  pub message: Option<String>,
  pub rating: Option<i32>,
  pub image_url: Option<String>,
  pub published: bool,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateTestimonial {
  pub name: String,
  pub title: Option<String>,
  pub company: Option<String>,
  pub message: Option<String>,
  pub rating: Option<i32>,
  pub image_url: Option<String>,
  pub published: Option<bool>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateTestimonial {
  pub name: Option<String>,
  pub title: Option<String>,
  pub company: Option<String>,
  pub message: Option<String>,
  pub rating: Option<i32>,
  pub image_url: Option<String>,
  pub published: Option<bool>,
}
