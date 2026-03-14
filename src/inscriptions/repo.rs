use sqlx::PgPool;

use super::{ConfirmerInscription, CreateInscription, InscriptionFormation, UpdateInscription};

const SELECT: &str = r#"
  SELECT id, formation_id, numero_inscription, nom, prenom, email, telephone,
         profession, entreprise, statut, fiche_telechargee_le, paiement_confirme_le,
         montant_paye, notes, created_at, updated_at
  FROM inscriptions_formations
"#;

pub async fn list_all(db: &PgPool) -> Result<Vec<InscriptionFormation>, sqlx::Error> {
  sqlx::query_as::<_, InscriptionFormation>(&format!(
    "{} ORDER BY created_at DESC",
    SELECT
  ))
  .fetch_all(db)
  .await
}

pub async fn get_by_numero(
  db: &PgPool,
  numero: &str,
) -> Result<Option<InscriptionFormation>, sqlx::Error> {
  sqlx::query_as::<_, InscriptionFormation>(&format!(
    "{} WHERE numero_inscription = $1",
    SELECT
  ))
  .bind(numero)
  .fetch_optional(db)
  .await
}

pub async fn create(
  db: &PgPool,
  input: CreateInscription,
) -> Result<InscriptionFormation, sqlx::Error> {
  sqlx::query_as::<_, InscriptionFormation>(
    r#"
    INSERT INTO inscriptions_formations
      (formation_id, nom, prenom, email, telephone, profession, entreprise, notes)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING id, formation_id, numero_inscription, nom, prenom, email, telephone,
              profession, entreprise, statut, fiche_telechargee_le, paiement_confirme_le,
              montant_paye, notes, created_at, updated_at
    "#,
  )
  .bind(input.formation_id)
  .bind(&input.nom)
  .bind(&input.prenom)
  .bind(&input.email)
  .bind(&input.telephone)
  .bind(&input.profession)
  .bind(&input.entreprise)
  .bind(&input.notes)
  .fetch_one(db)
  .await
}

pub async fn update(
  db: &PgPool,
  id: i64,
  input: UpdateInscription,
) -> Result<Option<InscriptionFormation>, sqlx::Error> {
  sqlx::query_as::<_, InscriptionFormation>(
    r#"
    UPDATE inscriptions_formations SET
      statut               = COALESCE($2, statut),
      montant_paye         = COALESCE($3, montant_paye),
      notes                = COALESCE($4, notes),
      paiement_confirme_le = COALESCE($5, paiement_confirme_le)
    WHERE id = $1
    RETURNING id, formation_id, numero_inscription, nom, prenom, email, telephone,
              profession, entreprise, statut, fiche_telechargee_le, paiement_confirme_le,
              montant_paye, notes, created_at, updated_at
    "#,
  )
  .bind(id)
  .bind(input.statut)
  .bind(input.montant_paye)
  .bind(input.notes)
  .bind(input.paiement_confirme_le)
  .fetch_optional(db)
  .await
}

pub async fn confirmer(
  db: &PgPool,
  input: ConfirmerInscription,
) -> Result<Option<InscriptionFormation>, sqlx::Error> {
  sqlx::query_as::<_, InscriptionFormation>(
    r#"
    UPDATE inscriptions_formations SET
      statut               = 'confirmee',
      paiement_confirme_le = NOW(),
      montant_paye         = COALESCE($2, montant_paye)
    WHERE numero_inscription = $1
    RETURNING id, formation_id, numero_inscription, nom, prenom, email, telephone,
              profession, entreprise, statut, fiche_telechargee_le, paiement_confirme_le,
              montant_paye, notes, created_at, updated_at
    "#,
  )
  .bind(&input.numero_inscription)
  .bind(input.montant_paye)
  .fetch_optional(db)
  .await
}

pub async fn delete(db: &PgPool, id: i64) -> Result<bool, sqlx::Error> {
  let res = sqlx::query("DELETE FROM inscriptions_formations WHERE id = $1")
    .bind(id)
    .execute(db)
    .await?;
  Ok(res.rows_affected() > 0)
}
