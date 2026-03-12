use sqlx::PgPool;
use uuid::Uuid;

use crate::models::team::{TeamMember, UpdateTeamMember};

pub async fn get_public_member(db: &PgPool, member_id: Uuid) -> Result<Option<TeamMember>, sqlx::Error> {
  sqlx::query_as::<_, TeamMember>(
    r#"
    SELECT id, name, title, role, email, phone, image_url, description, bio,
           social_links, ordering, is_visible, is_founder, created_at, updated_at
    FROM team_members
    WHERE id = $1 AND is_visible = TRUE
    "#,
  )
  .bind(member_id)
  .fetch_optional(db)
  .await
}

pub async fn get_member_profile(db: &PgPool, member_id: Uuid) -> Result<Option<TeamMember>, sqlx::Error> {
  // Profile = full row (visibility ignored), access is enforced at route level.
  sqlx::query_as::<_, TeamMember>(
    r#"
    SELECT id, name, title, role, email, phone, image_url, description, bio,
           social_links, ordering, is_visible, is_founder, created_at, updated_at
    FROM team_members
    WHERE id = $1
    "#,
  )
  .bind(member_id)
  .fetch_optional(db)
  .await
}

pub async fn update_member_profile(
  db: &PgPool,
  member_id: Uuid,
  input: UpdateTeamMember,
) -> Result<Option<TeamMember>, sqlx::Error> {
  // Reuse the same semantics as admin update, but caller controls which fields are set.
  // This keeps implementation consistent and reduces attack surface.
  super::super::team::repo::update(db, member_id, input).await
}

pub async fn update_member_photo(
  db: &PgPool,
  member_id: Uuid,
  image_url: String,
) -> Result<Option<TeamMember>, sqlx::Error> {
  let input = UpdateTeamMember {
    name: None,
    title: None,
    role: None,
    email: None,
    phone: None,
    image_url: Some(image_url),
    description: None,
    bio: None,
    social_links: None,
    ordering: None,
    is_visible: None,
    is_founder: None,
  };

  super::super::team::repo::update(db, member_id, input).await
}
