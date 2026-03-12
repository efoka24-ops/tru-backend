use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct TeamMember {
  pub id: Uuid,
  pub name: String,
  pub title: Option<String>,
  pub role: Option<String>,
  pub email: Option<String>,
  pub phone: Option<String>,
  pub image_url: Option<String>,
  pub description: Option<String>,
  pub bio: Option<String>,
  pub social_links: sqlx::types::Json<serde_json::Value>,
  pub ordering: Option<i32>,
  pub is_visible: bool,
  pub is_founder: bool,
  pub created_at: chrono::DateTime<chrono::Utc>,
  pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateTeamMember {
  pub name: String,
  pub title: Option<String>,
  pub role: Option<String>,
  pub email: Option<String>,
  pub phone: Option<String>,
  pub image_url: Option<String>,
  pub description: Option<String>,
  pub bio: Option<String>,
  pub social_links: Option<serde_json::Value>,
  pub ordering: Option<i32>,
  pub is_visible: Option<bool>,
  pub is_founder: Option<bool>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateTeamMember {
  pub name: Option<String>,
  pub title: Option<String>,
  pub role: Option<String>,
  pub email: Option<String>,
  pub phone: Option<String>,
  pub image_url: Option<String>,
  pub description: Option<String>,
  pub bio: Option<String>,
  pub social_links: Option<serde_json::Value>,
  pub ordering: Option<i32>,
  pub is_visible: Option<bool>,
  pub is_founder: Option<bool>,
}
