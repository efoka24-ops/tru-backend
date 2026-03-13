pub mod repo;

use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct InscriptionFormation {
  pub id: i64,
  pub formation_id: Option<i64>,
  pub numero_inscription: String,
  pub nom: String,
  pub prenom: String,
  pub email: String,
  pub telephone: String,
  pub profession: Option<String>,
  pub entreprise: Option<String>,
  pub statut: Option<String>,
  pub fiche_telechargee_le: Option<DateTime<Utc>>,
  pub paiement_confirme_le: Option<DateTime<Utc>>,
  pub montant_paye: Option<Decimal>,
  pub notes: Option<String>,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateInscription {
  pub formation_id: Option<i64>,
  pub nom: String,
  pub prenom: String,
  pub email: String,
  pub telephone: String,
  pub profession: Option<String>,
  pub entreprise: Option<String>,
  pub notes: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateInscription {
  pub statut: Option<String>,
  pub montant_paye: Option<Decimal>,
  pub notes: Option<String>,
  pub paiement_confirme_le: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ConfirmerInscription {
  pub numero_inscription: String,
  pub montant_paye: Option<Decimal>,
}
