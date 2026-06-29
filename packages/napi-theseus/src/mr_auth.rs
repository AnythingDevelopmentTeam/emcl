use crate::error::map_theseus;
use crate::runtime;

/// Get current Modrinth credentials
#[napi]
pub async fn mr_auth_get() -> napi::Result<Option<serde_json::Value>> {
	runtime()
		.spawn(async move {
			let creds = map_theseus(theseus::mr_auth::get_credentials().await)?;
			Ok(creds.map(|c| serde_json::to_value(&c).unwrap_or_default()))
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Log out of Modrinth
#[napi]
pub async fn mr_auth_logout() -> napi::Result<()> {
	runtime()
		.spawn(async move { map_theseus(theseus::mr_auth::logout().await) })
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}
