use sqlx::PgPool;
use uuid::Uuid;

use crate::models::solutions::{CreateSolution, Solution, UpdateSolution};

pub async fn list(db: &PgPool) -> Result<Vec<Solution>, sqlx::Error> {
  sqlx::query_as::<_, Solution>(
    r#"
    SELECT id, title, description, icon, image_url, details, created_at, updated_at
    FROM solutions
    ORDER BY created_at ASC
    "#,
  )
  .fetch_all(db)
  .await
}

pub async fn get_by_id(db: &PgPool, id: Uuid) -> Result<Option<Solution>, sqlx::Error> {
  sqlx::query_as::<_, Solution>(
    r#"
    SELECT id, title, description, icon, image_url, details, created_at, updated_at
    FROM solutions
    WHERE id = $1
    "#,
  )
  .bind(id)
  .fetch_optional(db)
  .await
}

pub async fn create(db: &PgPool, input: CreateSolution) -> Result<Solution, sqlx::Error> {
  let details = input.details.unwrap_or_else(|| serde_json::json!({}));
  sqlx::query_as::<_, Solution>(
    r#"
    INSERT INTO solutions (title, description, icon, image_url, details)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING id, title, description, icon, image_url, details, created_at, updated_at
    "#,
  )
  .bind(input.title)
  .bind(input.description)
  .bind(input.icon)
  .bind(input.image_url)
  .bind(sqlx::types::Json(details))
  .fetch_one(db)
  .await
}

pub async fn update(db: &PgPool, id: Uuid, input: UpdateSolution) -> Result<Option<Solution>, sqlx::Error> {
  let details = input.details.map(sqlx::types::Json);
  sqlx::query_as::<_, Solution>(
    r#"
    UPDATE solutions
    SET
      title = COALESCE($2, title),
      description = COALESCE($3, description),
      icon = COALESCE($4, icon),
      image_url = COALESCE($5, image_url),
      details = COALESCE($6, details)
    WHERE id = $1
    RETURNING id, title, description, icon, image_url, details, created_at, updated_at
    "#,
  )
  .bind(id)
  .bind(input.title)
  .bind(input.description)
  .bind(input.icon)
  .bind(input.image_url)
  .bind(details)
  .fetch_optional(db)
  .await
}

pub async fn delete(db: &PgPool, id: Uuid) -> Result<bool, sqlx::Error> {
  let res = sqlx::query("DELETE FROM solutions WHERE id = $1")
    .bind(id)
    .execute(db)
    .await?;
  Ok(res.rows_affected() > 0)
}
