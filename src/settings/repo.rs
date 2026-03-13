use sqlx::PgPool;

pub async fn get(db: &PgPool) -> Result<serde_json::Value, sqlx::Error> {
  let row: Option<(sqlx::types::Json<serde_json::Value>,)> =
    sqlx::query_as("SELECT data FROM site_settings LIMIT 1")
      .fetch_optional(db)
      .await?;
  Ok(row.map(|r| r.0 .0).unwrap_or_else(|| serde_json::json!({})))
}

pub async fn upsert(
  db: &PgPool,
  data: serde_json::Value,
) -> Result<serde_json::Value, sqlx::Error> {
  let row: (sqlx::types::Json<serde_json::Value>,) = sqlx::query_as(
    r#"
    INSERT INTO site_settings (id, data)
    VALUES (1, $1)
    ON CONFLICT (id) DO UPDATE
      SET data = EXCLUDED.data, updated_at = NOW()
    RETURNING data
    "#,
  )
  .bind(sqlx::types::Json(data))
  .fetch_one(db)
  .await?;
  Ok(row.0 .0)
}
