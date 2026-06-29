use crate::error::map_theseus;
use crate::runtime;

/// Get Minecraft versions from Daedalus
#[napi]
pub async fn metadata_get_minecraft_versions() -> napi::Result<serde_json::Value> {
	runtime()
		.spawn(async move {
			let versions = map_theseus(theseus::metadata::get_minecraft_versions().await)?;
			Ok(serde_json::to_value(&versions).unwrap_or_default())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get loader versions from Daedalus
#[napi]
pub async fn metadata_get_loader_versions(loader: String) -> napi::Result<serde_json::Value> {
	runtime()
		.spawn(async move {
			let versions = map_theseus(theseus::metadata::get_loader_versions(&loader).await)?;
			Ok(serde_json::to_value(&versions).unwrap_or_default())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}
