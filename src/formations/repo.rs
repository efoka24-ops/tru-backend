use sqlx::PgPool;

use super::{CreateFormation, Formation, UpdateFormation};

const LIST_SQL: &str = r#"
	SELECT id, titre, description, prix, duree, format, lieu, modules,
				 image_url, places_disponibles, statut, date_debut, date_fin,
				 created_at, updated_at
	FROM formations
	ORDER BY created_at DESC
"#;

const LIST_ACTIVE_SQL: &str = r#"
	SELECT id, titre, description, prix, duree, format, lieu, modules,
				 image_url, places_disponibles, statut, date_debut, date_fin,
				 created_at, updated_at
	FROM formations
	WHERE statut = 'active'
	ORDER BY created_at DESC
"#;

const GET_BY_ID_SQL: &str = r#"
	SELECT id, titre, description, prix, duree, format, lieu, modules,
				 image_url, places_disponibles, statut, date_debut, date_fin,
				 created_at, updated_at
	FROM formations
	WHERE id = $1
"#;

const CREATE_SQL: &str = r#"
	INSERT INTO formations
		(titre, description, prix, duree, format, lieu, modules, image_url,
		 places_disponibles, statut, date_debut, date_fin)
	VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
	RETURNING id, titre, description, prix, duree, format, lieu, modules,
						image_url, places_disponibles, statut, date_debut, date_fin,
						created_at, updated_at
"#;

const UPDATE_SQL: &str = r#"
	UPDATE formations SET
		titre            = COALESCE($2, titre),
		description      = COALESCE($3, description),
		prix             = COALESCE($4, prix),
		duree            = COALESCE($5, duree),
		format           = COALESCE($6, format),
		lieu             = COALESCE($7, lieu),
		modules          = COALESCE($8, modules),
		image_url        = COALESCE($9, image_url),
		places_disponibles = COALESCE($10, places_disponibles),
		statut           = COALESCE($11, statut),
		date_debut       = COALESCE($12, date_debut),
		date_fin         = COALESCE($13, date_fin)
	WHERE id = $1
	RETURNING id, titre, description, prix, duree, format, lieu, modules,
						image_url, places_disponibles, statut, date_debut, date_fin,
						created_at, updated_at
"#;

pub async fn list(db: &PgPool) -> Result<Vec<Formation>, sqlx::Error> {
	sqlx::query_as::<_, Formation>(LIST_SQL)
		.fetch_all(db)
		.await
}

pub async fn list_active(db: &PgPool) -> Result<Vec<Formation>, sqlx::Error> {
	sqlx::query_as::<_, Formation>(LIST_ACTIVE_SQL)
	.fetch_all(db)
	.await
}

pub async fn get_by_id(db: &PgPool, id: i64) -> Result<Option<Formation>, sqlx::Error> {
	sqlx::query_as::<_, Formation>(GET_BY_ID_SQL)
		.bind(id)
		.fetch_optional(db)
		.await
}

pub async fn create(db: &PgPool, input: CreateFormation) -> Result<Formation, sqlx::Error> {
	let modules = input.modules.map(sqlx::types::Json);
	sqlx::query_as::<_, Formation>(CREATE_SQL)
		.bind(&input.titre)
		.bind(&input.description)
		.bind(input.prix)
		.bind(&input.duree)
		.bind(&input.format)
		.bind(&input.lieu)
		.bind(modules)
		.bind(&input.image_url)
		.bind(input.places_disponibles)
		.bind(input.statut.as_deref().unwrap_or("active"))
		.bind(input.date_debut)
		.bind(input.date_fin)
		.fetch_one(db)
		.await
}

pub async fn update(
	db: &PgPool,
	id: i64,
	input: UpdateFormation,
) -> Result<Option<Formation>, sqlx::Error> {
	let modules = input.modules.map(sqlx::types::Json);
	sqlx::query_as::<_, Formation>(UPDATE_SQL)
		.bind(id)
		.bind(input.titre)
		.bind(input.description)
		.bind(input.prix)
		.bind(input.duree)
		.bind(input.format)
		.bind(input.lieu)
		.bind(modules)
		.bind(input.image_url)
		.bind(input.places_disponibles)
		.bind(input.statut)
		.bind(input.date_debut)
		.bind(input.date_fin)
		.fetch_optional(db)
		.await
}

pub async fn delete(db: &PgPool, id: i64) -> Result<bool, sqlx::Error> {
	let res = sqlx::query("DELETE FROM formations WHERE id = $1")
		.bind(id)
		.execute(db)
		.await?;
	Ok(res.rows_affected() > 0)
}
