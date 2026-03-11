use sqlx::PgPool;
use uuid::Uuid;

use crate::models::testimonials::{CreateTestimonial, Testimonial, UpdateTestimonial};

pub async fn list_published(db: &PgPool) -> Result<Vec<Testimonial>, sqlx::Error> {
  sqlx::query_as::<_, Testimonial>(
    r#"
    SELECT id, name, title, company, message, rating, image_url, published, created_at, updated_at
    FROM testimonials
    WHERE published = TRUE
    ORDER BY created_at DESC
    "#,
  )
  .fetch_all(db)
  .await
}

pub async fn list_all(db: &PgPool) -> Result<Vec<Testimonial>, sqlx::Error> {
  sqlx::query_as::<_, Testimonial>(
    r#"
    SELECT id, name, title, company, message, rating, image_url, published, created_at, updated_at
    FROM testimonials
    ORDER BY created_at DESC
    "#,
  )
  .fetch_all(db)
  .await
}

pub async fn get_by_id(db: &PgPool, id: Uuid) -> Result<Option<Testimonial>, sqlx::Error> {
  sqlx::query_as::<_, Testimonial>(
    r#"
    SELECT id, name, title, company, message, rating, image_url, published, created_at, updated_at
    FROM testimonials
    WHERE id = $1
    "#,
  )
  .bind(id)
  .fetch_optional(db)
  .await
}

pub async fn create(db: &PgPool, input: CreateTestimonial) -> Result<Testimonial, sqlx::Error> {
  let published = input.published.unwrap_or(true);

  sqlx::query_as::<_, Testimonial>(
    r#"
    INSERT INTO testimonials (name, title, company, message, rating, image_url, published)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING id, name, title, company, message, rating, image_url, published, created_at, updated_at
    "#,
  )
  .bind(input.name)
  .bind(input.title)
  .bind(input.company)
  .bind(input.message)
  .bind(input.rating)
  .bind(input.image_url)
  .bind(published)
  .fetch_one(db)
  .await
}

pub async fn update(db: &PgPool, id: Uuid, input: UpdateTestimonial) -> Result<Option<Testimonial>, sqlx::Error> {
  sqlx::query_as::<_, Testimonial>(
    r#"
    UPDATE testimonials
    SET
      name = COALESCE($2, name),
      title = COALESCE($3, title),
      company = COALESCE($4, company),
      message = COALESCE($5, message),
      rating = COALESCE($6, rating),
      image_url = COALESCE($7, image_url),
      published = COALESCE($8, published)
    WHERE id = $1
    RETURNING id, name, title, company, message, rating, image_url, published, created_at, updated_at
    "#,
  )
  .bind(id)
  .bind(input.name)
  .bind(input.title)
  .bind(input.company)
  .bind(input.message)
  .bind(input.rating)
  .bind(input.image_url)
  .bind(input.published)
  .fetch_optional(db)
  .await
}

pub async fn delete(db: &PgPool, id: Uuid) -> Result<bool, sqlx::Error> {
  let res = sqlx::query("DELETE FROM testimonials WHERE id = $1").bind(id).execute(db).await?;
  Ok(res.rows_affected() > 0)
}
