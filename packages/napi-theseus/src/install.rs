use crate::error::map_theseus;
use crate::runtime;

/// Create a new instance
#[napi]
pub async fn install_create_instance(
	name: String,
	game_version: String,
	loader: String,
	loader_version: Option<String>,
	icon_path: Option<String>,
	link_json: Option<String>,
) -> napi::Result<serde_json::Value> {
	let handle = runtime().spawn(async move {
		let ml: theseus::data::ModLoader = serde_json::from_str(&format!("\"{loader}\""))
			.map_err(|e| napi::Error::from_reason(format!("Invalid ModLoader: {e}")))?;
		let link: theseus::data::InstanceLink = match link_json {
			Some(j) => serde_json::from_str(&j)
				.map_err(|e| napi::Error::from_reason(format!("Invalid InstanceLink: {e}")))?,
			None => theseus::data::InstanceLink::Unmanaged,
		};
		let instance = map_theseus(
			theseus::install::create_instance(name, game_version, ml, loader_version, icon_path, link)
				.await,
		)?;
		Ok(serde_json::to_value(&instance).unwrap_or_default())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// List all install jobs
#[napi]
pub async fn install_job_list(include_finished: bool) -> napi::Result<Vec<serde_json::Value>> {
	let handle = runtime().spawn(async move {
		let jobs = map_theseus(theseus::install::list_jobs(include_finished).await)?;
		Ok(jobs
			.into_iter()
			.map(|j| serde_json::to_value(&j).unwrap_or_default())
			.collect())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get a single install job
#[napi]
pub async fn install_job_get(job_id: String) -> napi::Result<serde_json::Value> {
	let uuid = uuid::Uuid::parse_str(&job_id)
		.map_err(|e| napi::Error::from_reason(format!("Invalid UUID: {e}")))?;
	let handle = runtime().spawn(async move {
		let job = map_theseus(theseus::install::get_job(uuid).await)?;
		Ok(serde_json::to_value(&job).unwrap_or_default())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Retry a failed install job
#[napi]
pub async fn install_job_retry(job_id: String) -> napi::Result<serde_json::Value> {
	let uuid = uuid::Uuid::parse_str(&job_id)
		.map_err(|e| napi::Error::from_reason(format!("Invalid UUID: {e}")))?;
	let handle = runtime().spawn(async move {
		let job = map_theseus(theseus::install::retry_job(uuid).await)?;
		Ok(serde_json::to_value(&job).unwrap_or_default())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Cancel an install job
#[napi]
pub async fn install_job_cancel(job_id: String) -> napi::Result<serde_json::Value> {
	let uuid = uuid::Uuid::parse_str(&job_id)
		.map_err(|e| napi::Error::from_reason(format!("Invalid UUID: {e}")))?;
	let handle = runtime().spawn(async move {
		let job = map_theseus(theseus::install::cancel_job(uuid).await)?;
		Ok(serde_json::to_value(&job).unwrap_or_default())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Dismiss a completed install job
#[napi]
pub async fn install_job_dismiss(job_id: String) -> napi::Result<()> {
	let uuid = uuid::Uuid::parse_str(&job_id)
		.map_err(|e| napi::Error::from_reason(format!("Invalid UUID: {e}")))?;
	let handle = runtime().spawn(async move {
		map_theseus(theseus::install::dismiss_job(uuid).await)?;
		Ok(())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}
