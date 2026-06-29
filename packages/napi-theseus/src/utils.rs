use crate::error::map_theseus;
use crate::runtime;

/// Get the OS type
#[napi]
pub fn utils_get_os() -> String {
	std::env::consts::OS.to_string()
}

/// Check if running in development mode
#[napi]
pub fn utils_is_dev() -> bool {
	cfg!(debug_assertions)
}

/// Check if updates are enabled
#[napi]
pub fn utils_are_updates_enabled() -> bool {
	cfg!(feature = "updater")
		&& std::env::var("MODRINTH_EXTERNAL_UPDATE_PROVIDER").is_err()
}

/// Check if network is metered
#[napi]
pub async fn utils_is_network_metered() -> napi::Result<bool> {
	runtime()
		.spawn(async move { map_theseus(theseus::prelude::is_network_metered().await) })
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// List active progress bars
#[napi]
pub async fn utils_progress_bars_list() -> napi::Result<Vec<serde_json::Value>> {
	runtime()
		.spawn(async move {
			let bars = map_theseus(theseus::EventState::list_progress_bars().await)?;
			Ok(bars
				.into_iter()
				.map(|(_, b)| serde_json::to_value(&b).unwrap_or_default())
				.collect())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}
