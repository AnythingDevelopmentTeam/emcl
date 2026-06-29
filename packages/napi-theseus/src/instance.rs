use crate::error::map_theseus;
use crate::runtime;
use napi::bindgen_prelude::*;

/// List all instances
#[napi]
pub async fn instance_list() -> napi::Result<Vec<serde_json::Value>> {
	let handle = runtime().spawn(async move {
		let instances = map_theseus(theseus::instance::list().await)?;
		Ok(instances
			.into_iter()
			.map(|i| serde_json::to_value(&i).unwrap_or_default())
			.collect())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get a single instance by ID
#[napi]
pub async fn instance_get(instance_id: String) -> napi::Result<serde_json::Value> {
	let handle = runtime().spawn(async move {
		let instance = map_theseus(theseus::instance::get(&instance_id).await)?;
		Ok(serde_json::to_value(&instance).unwrap_or_default())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get multiple instances by IDs
#[napi]
pub async fn instance_get_many(instance_ids: Vec<String>) -> napi::Result<Vec<serde_json::Value>> {
	let handle = runtime().spawn(async move {
		let ids: Vec<&str> = instance_ids.iter().map(String::as_str).collect();
		let instances = map_theseus(theseus::instance::get_many(&ids).await)?;
		Ok(instances
			.into_iter()
			.map(|i| serde_json::to_value(&i).unwrap_or_default())
			.collect())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Remove an instance
#[napi]
pub async fn instance_remove(instance_id: String) -> napi::Result<()> {
	let handle = runtime().spawn(async move {
		map_theseus(theseus::instance::remove(&instance_id).await)?;
		Ok(())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get installed projects in an instance
#[napi]
pub async fn instance_get_projects(instance_id: String) -> napi::Result<Vec<serde_json::Value>> {
	let handle = runtime().spawn(async move {
		let projects = map_theseus(theseus::instance::get_projects(&instance_id, None).await)?;
		Ok(projects
			.into_iter()
			.map(|(_, p)| serde_json::to_value(&p).unwrap_or_default())
			.collect())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Run an instance (launch Minecraft)
#[napi]
pub async fn instance_run(instance_id: String) -> napi::Result<()> {
	let handle = runtime().spawn(async move {
		map_theseus(theseus::instance::run(&instance_id, theseus::instance::QuickPlayType::None).await)?;
		Ok(())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Kill a running instance
#[napi]
pub async fn instance_kill(instance_id: String) -> napi::Result<()> {
	let handle = runtime().spawn(async move {
		map_theseus(theseus::instance::kill(&instance_id).await)?;
		Ok(())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Edit instance metadata
#[napi]
pub async fn instance_edit(instance_id: String, metadata_json: String) -> napi::Result<()> {
	let handle = runtime().spawn(async move {
		let metadata: theseus::data::EditInstance =
			serde_json::from_str(&metadata_json)
				.map_err(|e| napi::Error::from_reason(format!("Invalid metadata JSON: {e}")))?;
		map_theseus(theseus::instance::edit(&instance_id, metadata).await)?;
		Ok(())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Edit instance icon
#[napi]
pub async fn instance_edit_icon(
	instance_id: String,
	icon_path: Option<String>,
) -> napi::Result<()> {
	let handle = runtime().spawn(async move {
		let path: Option<&std::path::Path> = icon_path.as_deref().map(std::path::Path::new);
		map_theseus(
			theseus::instance::edit_icon(&instance_id, path).await,
		)?;
		Ok(())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get optimal JRE key for an instance
#[napi]
pub async fn instance_get_optimal_jre_key(
	instance_id: String,
) -> napi::Result<Option<serde_json::Value>> {
	let handle = runtime().spawn(async move {
		let jre = map_theseus(theseus::instance::get_optimal_jre_key(&instance_id).await)?;
		Ok(jre.map(|j| serde_json::to_value(&j).unwrap_or_default()))
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Toggle enabling/disabling a project in an instance
#[napi]
pub async fn instance_toggle_disable_project(
	instance_id: String,
	project_id: String,
	desired_enabled: Option<bool>,
) -> napi::Result<()> {
	let handle = runtime().spawn(async move {
		map_theseus(
			theseus::instance::toggle_disable_project(&instance_id, &project_id, desired_enabled).await,
		)?;
		Ok(())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Export instance as .mrpack
#[napi]
pub async fn instance_export_mrpack(
	instance_id: String,
	export_path: String,
	included_export_candidates: Vec<String>,
	version_id: Option<String>,
	description: Option<String>,
	name: Option<String>,
) -> napi::Result<()> {
	let handle = runtime().spawn(async move {
		let path = std::path::PathBuf::from(&export_path);
		map_theseus(
			theseus::instance::export_mrpack(&instance_id, path, included_export_candidates, version_id, description, name)
				.await,
		)?;
		Ok(())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Check if a project is installed in an instance
#[napi]
pub async fn instance_check_installed(
	instance_id: String,
	project_id: String,
) -> napi::Result<bool> {
	let handle = runtime().spawn(async move {
		let projects = map_theseus(theseus::instance::get_projects(&instance_id, None).await)?;
		Ok(projects.iter().any(|r|
			r.metadata.as_ref().map(|m| &m.project_id) == Some(&project_id)
		))
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}
