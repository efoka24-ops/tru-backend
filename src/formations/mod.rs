pub mod repo;

use chrono::{DateTime, NaiveDate, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct Formation {
  pub id: i64,
  pub titre: String,
  pub description: Option<String>,
  pub prix: Decimal,
  pub duree: String,
  pub format: String,
  pub lieu: Option<String>,
  pub modules: Option<sqlx::types::Json<serde_json::Value>>,
  pub image_url: Option<String>,
  pub places_disponibles: Option<i32>,
  pub statut: Option<String>,
  pub date_debut: Option<NaiveDate>,
  pub date_fin: Option<NaiveDate>,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateFormation {
  pub titre: String,
  pub description: Option<String>,
  pub prix: Decimal,
  pub duree: String,
  pub format: String,
  pub lieu: Option<String>,
  pub modules: Option<serde_json::Value>,
  pub image_url: Option<String>,
  pub places_disponibles: Option<i32>,
  pub statut: Option<String>,
  pub date_debut: Option<NaiveDate>,
  pub date_fin: Option<NaiveDate>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateFormation {
  pub titre: Option<String>,
  pub description: Option<String>,
  pub prix: Option<Decimal>,
  pub duree: Option<String>,
  pub format: Option<String>,
  pub lieu: Option<String>,
  pub modules: Option<serde_json::Value>,
  pub image_url: Option<String>,
  pub places_disponibles: Option<i32>,
  pub statut: Option<String>,
  pub date_debut: Option<NaiveDate>,
  pub date_fin: Option<NaiveDate>,
}
