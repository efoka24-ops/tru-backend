use chrono::{Duration, Utc};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
  pub sub: Uuid,
  pub role: String,
  pub member_id: Option<Uuid>,
  pub exp: i64,
  pub iat: i64,
}

pub fn sign_jwt(
  user_id: Uuid,
  role: &str,
  member_id: Option<Uuid>,
  secret: &str,
) -> Result<String, jsonwebtoken::errors::Error> {
  let now = Utc::now();
  let exp = now + Duration::days(7);
  let claims = Claims {
    sub: user_id,
    role: role.to_string(),
    member_id,
    iat: now.timestamp(),
    exp: exp.timestamp(),
  };

  jsonwebtoken::encode(&Header::default(), &claims, &EncodingKey::from_secret(secret.as_bytes()))
}

pub fn verify_jwt(token: &str, secret: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
  let data = jsonwebtoken::decode::<Claims>(
    token,
    &DecodingKey::from_secret(secret.as_bytes()),
    &Validation::default(),
  )?;
  Ok(data.claims)
}
