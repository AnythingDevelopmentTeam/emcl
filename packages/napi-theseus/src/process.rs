use crate::error::map_theseus;
use crate::runtime;

/// Get processes for an instance
#[napi]
pub async fn process_get_by_instance_id(
	instance_id: String,
) -> napi::Result<Vec<serde_json::Value>> {
	runtime()
		.spawn(async move {
			let procs = map_theseus(theseus::process::get_by_instance_id(&instance_id).await)?;
			Ok(procs
				.into_iter()
				.map(|p| serde_json::to_value(&p).unwrap_or_default())
				.collect())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get all running game processes
#[napi]
pub async fn process_get_all() -> napi::Result<Vec<serde_json::Value>> {
	runtime()
		.spawn(async move {
			let procs = map_theseus(theseus::process::get_all().await)?;
			Ok(procs
				.into_iter()
				.map(|p| serde_json::to_value(&p).unwrap_or_default())
				.collect())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Kill a process by UUID
#[napi]
pub async fn process_kill(process_uuid: String) -> napi::Result<()> {
	let uuid = uuid::Uuid::parse_str(&process_uuid)
		.map_err(|e| napi::Error::from_reason(format!("Invalid UUID: {e}")))?;
	runtime()
		.spawn(async move { map_theseus(theseus::process::kill(uuid).await) })
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}
