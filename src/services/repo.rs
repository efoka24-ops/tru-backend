use sqlx::PgPool;
use uuid::Uuid;

use crate::models::services::{CreateService, Service, UpdateService};

pub async fn list(db: &PgPool) -> Result<Vec<Service>, sqlx::Error> {
  sqlx::query_as::<_, Service>(
    r#"
    SELECT id, icon, title, description, features, objective, color, image_url, created_at, updated_at
    FROM services
    ORDER BY created_at ASC
    "#,
  )
  .fetch_all(db)
  .await
}

pub async fn get_by_id(db: &PgPool, id: Uuid) -> Result<Option<Service>, sqlx::Error> {
  sqlx::query_as::<_, Service>(
    r#"
    SELECT id, icon, title, description, features, objective, color, image_url, created_at, updated_at
    FROM services
    WHERE id = $1
    "#,
  )
  .bind(id)
  .fetch_optional(db)
  .await
}

pub async fn create(db: &PgPool, input: CreateService) -> Result<Service, sqlx::Error> {
  let features = input.features.unwrap_or_else(|| serde_json::json!([]));

  sqlx::query_as::<_, Service>(
    r#"
    INSERT INTO services (icon, title, description, features, objective, color, image_url)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING id, icon, title, description, features, objective, color, image_url, created_at, updated_at
    "#,
  )
  .bind(input.icon)
  .bind(input.title)
  .bind(input.description)
  .bind(sqlx::types::Json(features))
  .bind(input.objective)
  .bind(input.color)
  .bind(input.image_url)
  .fetch_one(db)
  .await
}

pub async fn update(db: &PgPool, id: Uuid, input: UpdateService) -> Result<Option<Service>, sqlx::Error> {
  let features = input.features.map(sqlx::types::Json);

  sqlx::query_as::<_, Service>(
    r#"
    UPDATE services
    SET
      icon = COALESCE($2, icon),
      title = COALESCE($3, title),
      description = COALESCE($4, description),
      features = COALESCE($5, features),
      objective = COALESCE($6, objective),
      color = COALESCE($7, color),
      image_url = COALESCE($8, image_url)
    WHERE id = $1
    RETURNING id, icon, title, description, features, objective, color, image_url, created_at, updated_at
    "#,
  )
  .bind(id)
  .bind(input.icon)
  .bind(input.title)
  .bind(input.description)
  .bind(features)
  .bind(input.objective)
  .bind(input.color)
  .bind(input.image_url)
  .fetch_optional(db)
  .await
}

pub async fn delete(db: &PgPool, id: Uuid) -> Result<bool, sqlx::Error> {
  let res = sqlx::query("DELETE FROM services WHERE id = $1")
    .bind(id)
    .execute(db)
    .await?;
  Ok(res.rows_affected() > 0)
}
