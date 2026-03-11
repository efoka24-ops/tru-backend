use sqlx::PgPool;
use uuid::Uuid;

use crate::models::team::{CreateTeamMember, TeamMember, UpdateTeamMember};

pub async fn list_visible(db: &PgPool) -> Result<Vec<TeamMember>, sqlx::Error> {
  sqlx::query_as::<_, TeamMember>(
    r#"
    SELECT id, name, title, role, email, phone, image_url, description, bio,
           social_links, ordering, is_visible, is_founder, created_at, updated_at
    FROM team_members
    WHERE is_visible = TRUE
    ORDER BY ordering NULLS LAST, created_at ASC
    "#,
  )
  .fetch_all(db)
  .await
}

pub async fn get_by_id(db: &PgPool, id: Uuid) -> Result<Option<TeamMember>, sqlx::Error> {
  sqlx::query_as::<_, TeamMember>(
    r#"
    SELECT id, name, title, role, email, phone, image_url, description, bio,
           social_links, ordering, is_visible, is_founder, created_at, updated_at
    FROM team_members
    WHERE id = $1
    "#,
  )
  .bind(id)
  .fetch_optional(db)
  .await
}

pub async fn create(db: &PgPool, input: CreateTeamMember) -> Result<TeamMember, sqlx::Error> {
  let social_links = input
    .social_links
    .unwrap_or_else(|| serde_json::json!({}));

  let is_visible = input.is_visible.unwrap_or(true);
  let is_founder = input.is_founder.unwrap_or(false);

  sqlx::query_as::<_, TeamMember>(
    r#"
    INSERT INTO team_members (
      name, title, role, email, phone, image_url, description, bio,
      social_links, ordering, is_visible, is_founder
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING id, name, title, role, email, phone, image_url, description, bio,
              social_links, ordering, is_visible, is_founder, created_at, updated_at
    "#,
  )
  .bind(input.name)
  .bind(input.title)
  .bind(input.role)
  .bind(input.email)
  .bind(input.phone)
  .bind(input.image_url)
  .bind(input.description)
  .bind(input.bio)
  .bind(sqlx::types::Json(social_links))
  .bind(input.ordering)
  .bind(is_visible)
  .bind(is_founder)
  .fetch_one(db)
  .await
}

pub async fn update(
  db: &PgPool,
  id: Uuid,
  input: UpdateTeamMember,
) -> Result<Option<TeamMember>, sqlx::Error> {
  let social_links = input.social_links.map(sqlx::types::Json);

  sqlx::query_as::<_, TeamMember>(
    r#"
    UPDATE team_members
    SET
      name = COALESCE($2, name),
      title = COALESCE($3, title),
      role = COALESCE($4, role),
      email = COALESCE($5, email),
      phone = COALESCE($6, phone),
      image_url = COALESCE($7, image_url),
      description = COALESCE($8, description),
      bio = COALESCE($9, bio),
      social_links = COALESCE($10, social_links),
      ordering = COALESCE($11, ordering),
      is_visible = COALESCE($12, is_visible),
      is_founder = COALESCE($13, is_founder)
    WHERE id = $1
    RETURNING id, name, title, role, email, phone, image_url, description, bio,
              social_links, ordering, is_visible, is_founder, created_at, updated_at
    "#,
  )
  .bind(id)
  .bind(input.name)
  .bind(input.title)
  .bind(input.role)
  .bind(input.email)
  .bind(input.phone)
  .bind(input.image_url)
  .bind(input.description)
  .bind(input.bio)
  .bind(social_links)
  .bind(input.ordering)
  .bind(input.is_visible)
  .bind(input.is_founder)
  .fetch_optional(db)
  .await
}

pub async fn delete(db: &PgPool, id: Uuid) -> Result<bool, sqlx::Error> {
  let res = sqlx::query("DELETE FROM team_members WHERE id = $1")
    .bind(id)
    .execute(db)
    .await?;
  Ok(res.rows_affected() > 0)
}
