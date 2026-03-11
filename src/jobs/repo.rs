use sqlx::PgPool;
use uuid::Uuid;

use crate::models::jobs::{CreateJob, Job, UpdateJob};

pub async fn list_published(db: &PgPool) -> Result<Vec<Job>, sqlx::Error> {
  sqlx::query_as::<_, Job>(
    r#"
    SELECT id, title, description, location, job_type, salary_range, published, created_at, updated_at
    FROM jobs
    WHERE published = TRUE
    ORDER BY created_at DESC
    "#,
  )
  .fetch_all(db)
  .await
}

pub async fn list_all(db: &PgPool) -> Result<Vec<Job>, sqlx::Error> {
  sqlx::query_as::<_, Job>(
    r#"
    SELECT id, title, description, location, job_type, salary_range, published, created_at, updated_at
    FROM jobs
    ORDER BY created_at DESC
    "#,
  )
  .fetch_all(db)
  .await
}

pub async fn get_by_id(db: &PgPool, id: Uuid) -> Result<Option<Job>, sqlx::Error> {
  sqlx::query_as::<_, Job>(
    r#"
    SELECT id, title, description, location, job_type, salary_range, published, created_at, updated_at
    FROM jobs
    WHERE id = $1
    "#,
  )
  .bind(id)
  .fetch_optional(db)
  .await
}

pub async fn create(db: &PgPool, input: CreateJob) -> Result<Job, sqlx::Error> {
  let published = input.published.unwrap_or(true);
  sqlx::query_as::<_, Job>(
    r#"
    INSERT INTO jobs (title, description, location, job_type, salary_range, published)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING id, title, description, location, job_type, salary_range, published, created_at, updated_at
    "#,
  )
  .bind(input.title)
  .bind(input.description)
  .bind(input.location)
  .bind(input.job_type)
  .bind(input.salary_range)
  .bind(published)
  .fetch_one(db)
  .await
}

pub async fn update(db: &PgPool, id: Uuid, input: UpdateJob) -> Result<Option<Job>, sqlx::Error> {
  sqlx::query_as::<_, Job>(
    r#"
    UPDATE jobs
    SET
      title = COALESCE($2, title),
      description = COALESCE($3, description),
      location = COALESCE($4, location),
      job_type = COALESCE($5, job_type),
      salary_range = COALESCE($6, salary_range),
      published = COALESCE($7, published)
    WHERE id = $1
    RETURNING id, title, description, location, job_type, salary_range, published, created_at, updated_at
    "#,
  )
  .bind(id)
  .bind(input.title)
  .bind(input.description)
  .bind(input.location)
  .bind(input.job_type)
  .bind(input.salary_range)
  .bind(input.published)
  .fetch_optional(db)
  .await
}

pub async fn delete(db: &PgPool, id: Uuid) -> Result<bool, sqlx::Error> {
  let res = sqlx::query("DELETE FROM jobs WHERE id = $1").bind(id).execute(db).await?;
  Ok(res.rows_affected() > 0)
}
