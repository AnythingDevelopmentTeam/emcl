use crate::error::map_theseus;
use crate::runtime;

/// Get current settings
#[napi]
pub async fn settings_get() -> napi::Result<serde_json::Value> {
	let handle = runtime().spawn(async move {
		let settings = map_theseus(theseus::settings::get().await)?;
		Ok(serde_json::to_value(&settings).unwrap_or_default())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Update settings
#[napi]
pub async fn settings_set(settings_json: String) -> napi::Result<()> {
	let handle = runtime().spawn(async move {
		let settings: theseus::data::Settings = serde_json::from_str(&settings_json)
			.map_err(|e| napi::Error::from_reason(format!("Invalid settings JSON: {e}")))?;
		map_theseus(theseus::settings::set(settings).await)?;
		Ok(())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Cancel a pending directory change
#[napi]
pub async fn settings_cancel_directory_change(app_id: String) -> napi::Result<()> {
	let handle = runtime().spawn(async move {
		map_theseus(theseus::settings::cancel_directory_change(&app_id).await)?;
		Ok(())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}
