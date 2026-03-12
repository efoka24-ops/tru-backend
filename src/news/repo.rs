use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::models::news::{CreateNewsItem, NewsItem, UpdateNewsItem};

pub async fn list_published(db: &PgPool) -> Result<Vec<NewsItem>, sqlx::Error> {
  sqlx::query_as::<_, NewsItem>(
    r#"
    SELECT id, title, content, excerpt, image_url, published, published_at, created_at, updated_at
    FROM news
    WHERE published = TRUE
    ORDER BY published_at DESC NULLS LAST, created_at DESC
    "#,
  )
  .fetch_all(db)
  .await
}

pub async fn list_all(db: &PgPool) -> Result<Vec<NewsItem>, sqlx::Error> {
  sqlx::query_as::<_, NewsItem>(
    r#"
    SELECT id, title, content, excerpt, image_url, published, published_at, created_at, updated_at
    FROM news
    ORDER BY published_at DESC NULLS LAST, created_at DESC
    "#,
  )
  .fetch_all(db)
  .await
}

pub async fn get_by_id(db: &PgPool, id: Uuid) -> Result<Option<NewsItem>, sqlx::Error> {
  sqlx::query_as::<_, NewsItem>(
    r#"
    SELECT id, title, content, excerpt, image_url, published, published_at, created_at, updated_at
    FROM news
    WHERE id = $1
    "#,
  )
  .bind(id)
  .fetch_optional(db)
  .await
}

pub async fn create(db: &PgPool, input: CreateNewsItem) -> Result<NewsItem, sqlx::Error> {
  let published = input.published.unwrap_or(true);
  let published_at: Option<DateTime<Utc>> = input.published_at.or_else(|| if published { Some(Utc::now()) } else { None });

  sqlx::query_as::<_, NewsItem>(
    r#"
    INSERT INTO news (title, content, excerpt, image_url, published, published_at)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING id, title, content, excerpt, image_url, published, published_at, created_at, updated_at
    "#,
  )
  .bind(input.title)
  .bind(input.content)
  .bind(input.excerpt)
  .bind(input.image_url)
  .bind(published)
  .bind(published_at)
  .fetch_one(db)
  .await
}

pub async fn update(db: &PgPool, id: Uuid, input: UpdateNewsItem) -> Result<Option<NewsItem>, sqlx::Error> {
  sqlx::query_as::<_, NewsItem>(
    r#"
    UPDATE news
    SET
      title = COALESCE($2, title),
      content = COALESCE($3, content),
      excerpt = COALESCE($4, excerpt),
      image_url = COALESCE($5, image_url),
      published = COALESCE($6, published),
      published_at = COALESCE($7, published_at)
    WHERE id = $1
    RETURNING id, title, content, excerpt, image_url, published, published_at, created_at, updated_at
    "#,
  )
  .bind(id)
  .bind(input.title)
  .bind(input.content)
  .bind(input.excerpt)
  .bind(input.image_url)
  .bind(input.published)
  .bind(input.published_at)
  .fetch_optional(db)
  .await
}

pub async fn delete(db: &PgPool, id: Uuid) -> Result<bool, sqlx::Error> {
  let res = sqlx::query("DELETE FROM news WHERE id = $1").bind(id).execute(db).await?;
  Ok(res.rows_affected() > 0)
}
