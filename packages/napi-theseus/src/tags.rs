use crate::error::map_theseus;
use crate::runtime;

/// Get cached categories
#[napi]
pub async fn tags_get_categories() -> napi::Result<Vec<serde_json::Value>> {
	runtime()
		.spawn(async move {
			let tags = map_theseus(theseus::tags::get_category_tags().await)?;
			Ok(tags
				.into_iter()
				.map(|t| serde_json::to_value(&t).unwrap_or_default())
				.collect())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get cached loaders
#[napi]
pub async fn tags_get_loaders() -> napi::Result<Vec<serde_json::Value>> {
	runtime()
		.spawn(async move {
			let tags = map_theseus(theseus::tags::get_loader_tags().await)?;
			Ok(tags
				.into_iter()
				.map(|t| serde_json::to_value(&t).unwrap_or_default())
				.collect())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get cached game versions (tags)
#[napi]
pub async fn tags_get_game_versions() -> napi::Result<Vec<serde_json::Value>> {
	runtime()
		.spawn(async move {
			let versions = map_theseus(theseus::tags::get_game_version_tags().await)?;
			Ok(versions
				.into_iter()
				.map(|v| serde_json::to_value(&v).unwrap_or_default())
				.collect())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get cached donation platforms
#[napi]
pub async fn tags_get_donation_platforms() -> napi::Result<Vec<serde_json::Value>> {
	runtime()
		.spawn(async move {
			let platforms = map_theseus(theseus::tags::get_donation_platform_tags().await)?;
			Ok(platforms
				.into_iter()
				.map(|p| serde_json::to_value(&p).unwrap_or_default())
				.collect())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get cached report types
#[napi]
pub async fn tags_get_report_types() -> napi::Result<Vec<serde_json::Value>> {
	runtime()
		.spawn(async move {
			let types = map_theseus(theseus::tags::get_report_type_tags().await)?;
			Ok(types
				.into_iter()
				.map(|t| serde_json::to_value(&t).unwrap_or_default())
				.collect())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}
