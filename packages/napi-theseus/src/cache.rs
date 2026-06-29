use crate::error::map_theseus;
use crate::runtime;

fn parse_cache_behaviour(s: Option<String>) -> napi::Result<Option<theseus::data::CacheBehaviour>> {
	match s {
		None => Ok(None),
		Some(v) => Ok(Some(
			serde_json::from_str(&format!("\"{v}\""))
				.map_err(|e| napi::Error::from_reason(format!("Invalid CacheBehaviour: {e}")))?,
		)),
	}
}

/// Get a cached project
#[napi]
pub async fn cache_get_project(
	project_id: String,
	cache_behaviour: Option<String>,
) -> napi::Result<serde_json::Value> {
	let cb = parse_cache_behaviour(cache_behaviour)?;
	runtime()
		.spawn(async move {
			let project = map_theseus(theseus::cache::get_project(&project_id, cb).await)?;
			Ok(serde_json::to_value(&project).unwrap_or_default())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get multiple cached projects
#[napi]
pub async fn cache_get_project_many(
	project_ids: Vec<String>,
	cache_behaviour: Option<String>,
) -> napi::Result<Vec<serde_json::Value>> {
	let cb = parse_cache_behaviour(cache_behaviour)?;
	runtime()
		.spawn(async move {
			let ids: Vec<&str> = project_ids.iter().map(|s| s.as_str()).collect();
			let projects = map_theseus(theseus::cache::get_project_many(&ids, cb).await)?;
			Ok(projects
				.into_iter()
				.map(|p| serde_json::to_value(&p).unwrap_or_default())
				.collect())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get a cached version
#[napi]
pub async fn cache_get_version(
	version_id: String,
	cache_behaviour: Option<String>,
) -> napi::Result<serde_json::Value> {
	let cb = parse_cache_behaviour(cache_behaviour)?;
	runtime()
		.spawn(async move {
			let version = map_theseus(theseus::cache::get_version(&version_id, cb).await)?;
			Ok(serde_json::to_value(&version).unwrap_or_default())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get multiple cached versions
#[napi]
pub async fn cache_get_version_many(
	version_ids: Vec<String>,
	cache_behaviour: Option<String>,
) -> napi::Result<Vec<serde_json::Value>> {
	let cb = parse_cache_behaviour(cache_behaviour)?;
	runtime()
		.spawn(async move {
			let ids: Vec<&str> = version_ids.iter().map(|s| s.as_str()).collect();
			let versions = map_theseus(theseus::cache::get_version_many(&ids, cb).await)?;
			Ok(versions
				.into_iter()
				.map(|v| serde_json::to_value(&v).unwrap_or_default())
				.collect())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get a cached user
#[napi]
pub async fn cache_get_user(
	user_id: String,
	cache_behaviour: Option<String>,
) -> napi::Result<serde_json::Value> {
	let cb = parse_cache_behaviour(cache_behaviour)?;
	runtime()
		.spawn(async move {
			let user = map_theseus(theseus::cache::get_user(&user_id, cb).await)?;
			Ok(serde_json::to_value(&user).unwrap_or_default())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get multiple cached users
#[napi]
pub async fn cache_get_user_many(
	user_ids: Vec<String>,
	cache_behaviour: Option<String>,
) -> napi::Result<Vec<serde_json::Value>> {
	let cb = parse_cache_behaviour(cache_behaviour)?;
	runtime()
		.spawn(async move {
			let ids: Vec<&str> = user_ids.iter().map(|s| s.as_str()).collect();
			let users = map_theseus(theseus::cache::get_user_many(&ids, cb).await)?;
			Ok(users
				.into_iter()
				.map(|u| serde_json::to_value(&u).unwrap_or_default())
				.collect())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get a cached team
#[napi]
pub async fn cache_get_team(
	team_id: String,
	cache_behaviour: Option<String>,
) -> napi::Result<serde_json::Value> {
	let cb = parse_cache_behaviour(cache_behaviour)?;
	runtime()
		.spawn(async move {
			let team = map_theseus(theseus::cache::get_team(&team_id, cb).await)?;
			Ok(serde_json::to_value(&team).unwrap_or_default())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get multiple cached teams
#[napi]
pub async fn cache_get_team_many(
	team_ids: Vec<String>,
	cache_behaviour: Option<String>,
) -> napi::Result<Vec<serde_json::Value>> {
	let cb = parse_cache_behaviour(cache_behaviour)?;
	runtime()
		.spawn(async move {
			let ids: Vec<&str> = team_ids.iter().map(|s| s.as_str()).collect();
			let teams = map_theseus(theseus::cache::get_team_many(&ids, cb).await)?;
			Ok(teams
				.into_iter()
				.map(|t| serde_json::to_value(&t).unwrap_or_default())
				.collect())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get cached search results
#[napi]
pub async fn cache_get_search_results(
	url: String,
	cache_behaviour: Option<String>,
) -> napi::Result<serde_json::Value> {
	let cb = parse_cache_behaviour(cache_behaviour)?;
	runtime()
		.spawn(async move {
			let results = map_theseus(theseus::cache::get_search_results(&url, cb).await)?;
			Ok(serde_json::to_value(&results).unwrap_or_default())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Purge cache types
#[napi]
pub async fn cache_purge_types(types: Vec<String>) -> napi::Result<()> {
	runtime()
		.spawn(async move {
			let cache_types: Vec<theseus::data::CacheValueType> = types
				.iter()
				.filter_map(|t| serde_json::from_str(&format!("\"{t}\"")).ok())
				.collect();
			map_theseus(theseus::cache::purge_cache_types(&cache_types).await)
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}
