use sqlx::PgPool;
use uuid::Uuid;

use crate::models::contacts::{Contact, CreateContact, UpdateContact};

pub async fn list_all(db: &PgPool) -> Result<Vec<Contact>, sqlx::Error> {
  sqlx::query_as::<_, Contact>(
    r#"
    SELECT id, name, email, phone, subject, message, read, created_at, updated_at
    FROM contacts
    ORDER BY created_at DESC
    "#,
  )
  .fetch_all(db)
  .await
}

pub async fn create(db: &PgPool, input: CreateContact) -> Result<Contact, sqlx::Error> {
  sqlx::query_as::<_, Contact>(
    r#"
    INSERT INTO contacts (name, email, phone, subject, message)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING id, name, email, phone, subject, message, read, created_at, updated_at
    "#,
  )
  .bind(input.name)
  .bind(input.email)
  .bind(input.phone)
  .bind(input.subject)
  .bind(input.message)
  .fetch_one(db)
  .await
}

pub async fn update(db: &PgPool, id: Uuid, input: UpdateContact) -> Result<Option<Contact>, sqlx::Error> {
  sqlx::query_as::<_, Contact>(
    r#"
    UPDATE contacts
    SET read = COALESCE($2, read)
    WHERE id = $1
    RETURNING id, name, email, phone, subject, message, read, created_at, updated_at
    "#,
  )
  .bind(id)
  .bind(input.read)
  .fetch_optional(db)
  .await
}

pub async fn delete(db: &PgPool, id: Uuid) -> Result<bool, sqlx::Error> {
  let res = sqlx::query("DELETE FROM contacts WHERE id = $1").bind(id).execute(db).await?;
  Ok(res.rows_affected() > 0)
}
