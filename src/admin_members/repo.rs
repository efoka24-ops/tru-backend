use chrono::{DateTime, Duration, Utc};
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

use crate::auth::repo::User;

#[derive(Debug, Clone, FromRow, serde::Serialize)]
pub struct TeamMemberWithAccountRow {
  pub id: Uuid,
  pub name: String,
  pub title: Option<String>,
  pub role: Option<String>,
  pub email: Option<String>,
  pub phone: Option<String>,
  pub image_url: Option<String>,
  pub description: Option<String>,
  pub bio: Option<String>,
  pub social_links: sqlx::types::Json<serde_json::Value>,
  pub ordering: Option<i32>,
  pub is_visible: bool,
  pub is_founder: bool,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,

  pub account_id: Option<Uuid>,
  pub account_email: Option<String>,
  pub account_role: Option<String>,
  pub account_status: Option<String>,
  pub account_created_at: Option<DateTime<Utc>>,
  pub account_last_login: Option<DateTime<Utc>>,
}

#[derive(Debug, serde::Serialize)]
pub struct MemberAccountInfo {
  pub id: Uuid,
  pub email: String,
  pub role: String,
  pub status: String,
  pub created_at: DateTime<Utc>,
  pub last_login: Option<DateTime<Utc>>,
}

#[derive(Debug, serde::Serialize)]
pub struct TeamMemberWithAccount {
  pub id: Uuid,
  pub name: String,
  pub title: Option<String>,
  pub role: Option<String>,
  pub email: Option<String>,
  pub phone: Option<String>,
  pub image_url: Option<String>,
  pub description: Option<String>,
  pub bio: Option<String>,
  pub social_links: serde_json::Value,
  pub ordering: Option<i32>,
  pub is_visible: bool,
  pub is_founder: bool,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
  pub account: Option<MemberAccountInfo>,
}

pub async fn list_members_with_accounts(db: &PgPool) -> Result<Vec<TeamMemberWithAccount>, sqlx::Error> {
  let rows = sqlx::query_as::<_, TeamMemberWithAccountRow>(
    r#"
    SELECT
      tm.id, tm.name, tm.title, tm.role, tm.email, tm.phone, tm.image_url, tm.description, tm.bio,
      tm.social_links, tm.ordering, tm.is_visible, tm.is_founder, tm.created_at, tm.updated_at,
      u.id AS account_id,
      u.email AS account_email,
      u.role AS account_role,
      u.status AS account_status,
      u.created_at AS account_created_at,
      u.last_login AS account_last_login
    FROM team_members tm
    LEFT JOIN users u ON u.member_id = tm.id
    ORDER BY tm.ordering NULLS LAST, tm.created_at ASC
    "#,
  )
  .fetch_all(db)
  .await?;

  Ok(rows
    .into_iter()
    .map(|r| TeamMemberWithAccount {
      id: r.id,
      name: r.name,
      title: r.title,
      role: r.role,
      email: r.email,
      phone: r.phone,
      image_url: r.image_url,
      description: r.description,
      bio: r.bio,
      social_links: r.social_links.0,
      ordering: r.ordering,
      is_visible: r.is_visible,
      is_founder: r.is_founder,
      created_at: r.created_at,
      updated_at: r.updated_at,
      account: match (
        r.account_id,
        r.account_email,
        r.account_role,
        r.account_status,
        r.account_created_at,
      ) {
        (Some(id), Some(email), Some(role), Some(status), Some(created_at)) => Some(MemberAccountInfo {
          id,
          email,
          role,
          status,
          created_at,
          last_login: r.account_last_login,
        }),
        _ => None,
      },
    })
    .collect())
}

pub async fn update_member_email(db: &PgPool, member_id: Uuid, email: &str) -> Result<(), sqlx::Error> {
  let _ = sqlx::query("UPDATE team_members SET email = $2 WHERE id = $1")
    .bind(member_id)
    .bind(email)
    .execute(db)
    .await?;
  Ok(())
}

pub async fn create_account_for_member(
  db: &PgPool,
  member_id: Uuid,
  email: &str,
  name: Option<&str>,
  role: &str,
  login_code_hash: &str,
  login_code_expiry: DateTime<Utc>,
) -> Result<User, sqlx::Error> {
  // pending accounts cannot password-login; password_hash is a non-empty placeholder.
  crate::auth::repo::create_member_account(
    db,
    member_id,
    email,
    name,
    role,
    Some("disabled"),
    "pending",
    Some(login_code_hash),
    Some(login_code_expiry),
  )
  .await
}

pub async fn regenerate_login_code(
  db: &PgPool,
  member_id: Uuid,
  login_code_hash: &str,
  login_code_expiry: DateTime<Utc>,
) -> Result<Option<User>, sqlx::Error> {
  sqlx::query_as::<_, User>(
    r#"
    UPDATE users
    SET login_code_hash = $2, login_code_expiry = $3, status = 'pending'
    WHERE member_id = $1
    RETURNING id, email, name, role, password_hash, member_id, status, login_code_hash, login_code_expiry, last_login
    "#,
  )
  .bind(member_id)
  .bind(login_code_hash)
  .bind(login_code_expiry)
  .fetch_optional(db)
  .await
}

pub async fn update_account(
  db: &PgPool,
  member_id: Uuid,
  email: Option<&str>,
  role: Option<&str>,
  status: Option<&str>,
) -> Result<Option<User>, sqlx::Error> {
  sqlx::query_as::<_, User>(
    r#"
    UPDATE users
    SET
      email = COALESCE($2, email),
      role = COALESCE($3, role),
      status = COALESCE($4, status)
    WHERE member_id = $1
    RETURNING id, email, name, role, password_hash, member_id, status, login_code_hash, login_code_expiry, last_login
    "#,
  )
  .bind(member_id)
  .bind(email)
  .bind(role)
  .bind(status)
  .fetch_optional(db)
  .await
}

pub async fn delete_account(db: &PgPool, member_id: Uuid) -> Result<bool, sqlx::Error> {
  let res = sqlx::query("DELETE FROM users WHERE member_id = $1")
    .bind(member_id)
    .execute(db)
    .await?;
  Ok(res.rows_affected() > 0)
}

pub fn default_login_code_expiry() -> DateTime<Utc> {
  Utc::now() + Duration::minutes(30)
}
