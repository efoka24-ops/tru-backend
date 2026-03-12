use sqlx::PgPool;
use uuid::Uuid;

use crate::models::applications::{Application, CreateApplication, UpdateApplication};

pub async fn list_all(db: &PgPool) -> Result<Vec<Application>, sqlx::Error> {
  sqlx::query_as::<_, Application>(
    r#"
    SELECT id, job_id, first_name, last_name, email, phone, resume_url, cover_letter, status, created_at, updated_at
    FROM applications
    ORDER BY created_at DESC
    "#,
  )
  .fetch_all(db)
  .await
}

pub async fn create(db: &PgPool, input: CreateApplication) -> Result<Application, sqlx::Error> {
  sqlx::query_as::<_, Application>(
    r#"
    INSERT INTO applications (job_id, first_name, last_name, email, phone, resume_url, cover_letter)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING id, job_id, first_name, last_name, email, phone, resume_url, cover_letter, status, created_at, updated_at
    "#,
  )
  .bind(input.job_id)
  .bind(input.first_name)
  .bind(input.last_name)
  .bind(input.email)
  .bind(input.phone)
  .bind(input.resume_url)
  .bind(input.cover_letter)
  .fetch_one(db)
  .await
}

pub async fn update_status(db: &PgPool, id: Uuid, input: UpdateApplication) -> Result<Option<Application>, sqlx::Error> {
  sqlx::query_as::<_, Application>(
    r#"
    UPDATE applications
    SET status = COALESCE($2, status)
    WHERE id = $1
    RETURNING id, job_id, first_name, last_name, email, phone, resume_url, cover_letter, status, created_at, updated_at
    "#,
  )
  .bind(id)
  .bind(input.status)
  .fetch_optional(db)
  .await
}

pub async fn delete(db: &PgPool, id: Uuid) -> Result<bool, sqlx::Error> {
  let res = sqlx::query("DELETE FROM applications WHERE id = $1").bind(id).execute(db).await?;
  Ok(res.rows_affected() > 0)
}
