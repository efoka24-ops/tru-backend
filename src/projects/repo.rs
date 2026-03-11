use sqlx::PgPool;
use uuid::Uuid;

use crate::models::projects::{CreateProject, Project, UpdateProject};

pub async fn list(db: &PgPool) -> Result<Vec<Project>, sqlx::Error> {
  sqlx::query_as::<_, Project>(
    r#"
    SELECT id, name, client, description, category, status, technologies, details, created_at, updated_at
    FROM projects
    ORDER BY created_at DESC
    "#,
  )
  .fetch_all(db)
  .await
}

pub async fn get_by_id(db: &PgPool, id: Uuid) -> Result<Option<Project>, sqlx::Error> {
  sqlx::query_as::<_, Project>(
    r#"
    SELECT id, name, client, description, category, status, technologies, details, created_at, updated_at
    FROM projects
    WHERE id = $1
    "#,
  )
  .bind(id)
  .fetch_optional(db)
  .await
}

pub async fn create(db: &PgPool, input: CreateProject) -> Result<Project, sqlx::Error> {
  let technologies = input.technologies.unwrap_or_else(|| serde_json::json!([]));
  let details = input.details.unwrap_or_else(|| serde_json::json!({}));

  sqlx::query_as::<_, Project>(
    r#"
    INSERT INTO projects (name, client, description, category, status, technologies, details)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING id, name, client, description, category, status, technologies, details, created_at, updated_at
    "#,
  )
  .bind(input.name)
  .bind(input.client)
  .bind(input.description)
  .bind(input.category)
  .bind(input.status)
  .bind(sqlx::types::Json(technologies))
  .bind(sqlx::types::Json(details))
  .fetch_one(db)
  .await
}

pub async fn update(db: &PgPool, id: Uuid, input: UpdateProject) -> Result<Option<Project>, sqlx::Error> {
  let technologies = input.technologies.map(sqlx::types::Json);
  let details = input.details.map(sqlx::types::Json);

  sqlx::query_as::<_, Project>(
    r#"
    UPDATE projects
    SET
      name = COALESCE($2, name),
      client = COALESCE($3, client),
      description = COALESCE($4, description),
      category = COALESCE($5, category),
      status = COALESCE($6, status),
      technologies = COALESCE($7, technologies),
      details = COALESCE($8, details)
    WHERE id = $1
    RETURNING id, name, client, description, category, status, technologies, details, created_at, updated_at
    "#,
  )
  .bind(id)
  .bind(input.name)
  .bind(input.client)
  .bind(input.description)
  .bind(input.category)
  .bind(input.status)
  .bind(technologies)
  .bind(details)
  .fetch_optional(db)
  .await
}

pub async fn delete(db: &PgPool, id: Uuid) -> Result<bool, sqlx::Error> {
  let res = sqlx::query("DELETE FROM projects WHERE id = $1").bind(id).execute(db).await?;
  Ok(res.rows_affected() > 0)
}
