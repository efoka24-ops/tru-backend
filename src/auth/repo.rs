use sqlx::PgPool;
use uuid::Uuid;

use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, FromRow, serde::Serialize)]
pub struct User {
  pub id: Uuid,
  pub email: String,
  pub name: Option<String>,
  pub role: String,
  #[serde(skip_serializing)]
  pub password_hash: String,
  pub member_id: Option<Uuid>,
  pub status: String,
  pub login_code_expiry: Option<DateTime<Utc>>,
  pub last_login: Option<DateTime<Utc>>,
}

pub async fn create_user(
  db: &PgPool,
  email: &str,
  name: Option<&str>,
  role: &str,
  password_hash: &str,
) -> Result<User, sqlx::Error> {
  sqlx::query_as::<_, User>(
    r#"
    INSERT INTO users (email, name, role, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, name, role, password_hash, member_id, status, login_code_expiry, last_login
    "#,
  )
  .bind(email)
  .bind(name)
  .bind(role)
  .bind(password_hash)
  .fetch_one(db)
  .await
}

pub async fn find_user_by_email(db: &PgPool, email: &str) -> Result<Option<User>, sqlx::Error> {
  sqlx::query_as::<_, User>(
    r#"
    SELECT id, email, name, role, password_hash, member_id, status, login_code_expiry, last_login
    FROM users
    WHERE email = $1
    "#,
  )
  .bind(email)
  .fetch_optional(db)
  .await
}

pub async fn find_user_by_id(db: &PgPool, id: Uuid) -> Result<Option<User>, sqlx::Error> {
  sqlx::query_as::<_, User>(
    r#"
    SELECT id, email, name, role, password_hash, member_id, status, login_code_expiry, last_login
    FROM users
    WHERE id = $1
    "#,
  )
  .bind(id)
  .fetch_optional(db)
  .await
}

pub async fn create_member_account(
  db: &PgPool,
  member_id: Uuid,
  email: &str,
  name: Option<&str>,
  role: &str,
  password_hash: Option<&str>,
  status: &str,
  login_code_hash: Option<&str>,
  login_code_expiry: Option<DateTime<Utc>>,
) -> Result<User, sqlx::Error> {
  let password_hash = password_hash.unwrap_or("");

  sqlx::query_as::<_, User>(
    r#"
    INSERT INTO users (email, name, role, password_hash, member_id, status, login_code_hash, login_code_expiry)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING id, email, name, role, password_hash, member_id, status, login_code_expiry, last_login
    "#,
  )
  .bind(email)
  .bind(name)
  .bind(role)
  .bind(password_hash)
  .bind(member_id)
  .bind(status)
  .bind(login_code_hash)
  .bind(login_code_expiry)
  .fetch_one(db)
  .await
}

pub async fn find_user_by_login_code_hash(
  db: &PgPool,
  login_code_hash: &str,
) -> Result<Option<User>, sqlx::Error> {
  sqlx::query_as::<_, User>(
    r#"
    SELECT id, email, name, role, password_hash, member_id, status, login_code_expiry, last_login
    FROM users
    WHERE login_code_hash = $1
    "#,
  )
  .bind(login_code_hash)
  .fetch_optional(db)
  .await
}

pub async fn activate_user_with_password(
  db: &PgPool,
  user_id: Uuid,
  password_hash: &str,
) -> Result<Option<User>, sqlx::Error> {
  sqlx::query_as::<_, User>(
    r#"
    UPDATE users
    SET
      password_hash = $2,
      status = 'active',
      login_code_hash = NULL,
      login_code_expiry = NULL,
      last_login = NOW()
    WHERE id = $1
    RETURNING id, email, name, role, password_hash, member_id, status, login_code_expiry, last_login
    "#,
  )
  .bind(user_id)
  .bind(password_hash)
  .fetch_optional(db)
  .await
}

pub async fn update_last_login(db: &PgPool, user_id: Uuid) -> Result<(), sqlx::Error> {
  let _ = sqlx::query("UPDATE users SET last_login = NOW() WHERE id = $1")
    .bind(user_id)
    .execute(db)
    .await?;
  Ok(())
}

pub async fn any_admin_exists(db: &PgPool) -> Result<bool, sqlx::Error> {
  let row: Option<(i32,)> = sqlx::query_as(
    r#"
    SELECT 1
    FROM users
    WHERE role = 'admin'
    LIMIT 1
    "#,
  )
  .fetch_optional(db)
  .await?;

  Ok(row.is_some())
}

pub async fn create_or_promote_admin(
  db: &PgPool,
  email: &str,
  name: Option<&str>,
  password_hash: &str,
) -> Result<User, sqlx::Error> {
  sqlx::query_as::<_, User>(
    r#"
    INSERT INTO users (email, name, role, password_hash, status)
    VALUES ($1, $2, 'admin', $3, 'active')
    ON CONFLICT (email) DO UPDATE
    SET
      role = 'admin',
      status = 'active',
      password_hash = EXCLUDED.password_hash
    RETURNING id, email, name, role, password_hash, member_id, status, login_code_hash, login_code_expiry, last_login
    "#,
  )
  .bind(email)
  .bind(name)
  .bind(password_hash)
  .fetch_one(db)
  .await
}
