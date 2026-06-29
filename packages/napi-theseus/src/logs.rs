use crate::error::map_theseus;
use crate::runtime;

/// Get logs for an instance
#[napi]
pub async fn logs_get_logs(
	instance_id: String,
	clear_contents: Option<bool>,
) -> napi::Result<Vec<serde_json::Value>> {
	runtime()
		.spawn(async move {
			let logs = map_theseus(theseus::logs::get_logs(&instance_id, clear_contents).await)?;
			Ok(logs
				.into_iter()
				.map(|l| serde_json::to_value(&l).unwrap_or_default())
				.collect())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get logs by filename and type
#[napi]
pub async fn logs_get_by_filename(
	instance_id: String,
	log_type: String,
	filename: String,
) -> napi::Result<serde_json::Value> {
	runtime()
		.spawn(async move {
			let lt: theseus::logs::LogType = serde_json::from_str(&format!("\"{log_type}\""))
				.map_err(|e| napi::Error::from_reason(format!("Invalid log type: {e}")))?;
			let log = map_theseus(
				theseus::logs::get_logs_by_filename(&instance_id, lt, filename).await,
			)?;
			Ok(serde_json::to_value(&log).unwrap_or_default())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Delete logs for an instance
#[napi]
pub async fn logs_delete_logs(instance_id: String) -> napi::Result<()> {
	runtime()
		.spawn(async move { map_theseus(theseus::logs::delete_logs(&instance_id).await) })
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get latest log cursor for tailing
#[napi]
pub async fn logs_get_latest_log_cursor(
	instance_id: String,
	cursor: f64,
) -> napi::Result<serde_json::Value> {
	runtime()
		.spawn(async move {
			let result = map_theseus(
				theseus::logs::get_latest_log_cursor(&instance_id, cursor as u64).await,
			)?;
			Ok(serde_json::to_value(&result).unwrap_or_default())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get live log buffer
#[napi]
pub async fn logs_get_live_log_buffer(instance_id: String) -> napi::Result<serde_json::Value> {
	runtime()
		.spawn(async move {
			let result = map_theseus(theseus::logs::get_live_log_buffer(&instance_id).await)?;
			Ok(serde_json::to_value(&result).unwrap_or_default())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Clear live log buffer
#[napi]
pub fn logs_clear_live_log_buffer(instance_id: String) {
	theseus::logs::clear_live_log_buffer(&instance_id);
}
