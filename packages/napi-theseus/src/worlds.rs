use crate::error::map_theseus;
use crate::runtime;

/// Get recently played worlds
#[napi]
pub async fn worlds_get_recent(
	limit: i32,
	display_statuses: Vec<String>,
) -> napi::Result<Vec<serde_json::Value>> {
	let handle = runtime().spawn(async move {
		let mut ds = enumset::EnumSet::new();
		for s in &display_statuses {
			ds.insert(theseus::worlds::DisplayStatus::from_string(s));
		}
		let worlds = map_theseus(theseus::worlds::get_recent_worlds(limit as usize, ds).await)?;
		Ok(worlds
			.into_iter()
			.map(|w| serde_json::to_value(&w).unwrap_or_default())
			.collect())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get worlds for an instance
#[napi]
pub async fn worlds_get_instance_worlds(
	instance_id: String,
) -> napi::Result<Vec<serde_json::Value>> {
	let handle = runtime().spawn(async move {
		let worlds = map_theseus(theseus::worlds::get_instance_worlds(&instance_id).await)?;
		Ok(worlds
			.into_iter()
			.map(|w| serde_json::to_value(&w).unwrap_or_default())
			.collect())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Delete a world
#[napi]
pub async fn worlds_delete(
	instance_id: String,
	world_name: String,
) -> napi::Result<()> {
	let handle = runtime().spawn(async move {
		let path = std::path::Path::new(&instance_id);
		map_theseus(theseus::worlds::delete_world(path, &world_name).await)?;
		Ok(())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Backup a world
#[napi]
pub async fn worlds_backup(
	instance_id: String,
	world_name: String,
) -> napi::Result<()> {
	let handle = runtime().spawn(async move {
		let path = std::path::Path::new(&instance_id);
		map_theseus(theseus::worlds::backup_world(path, &world_name).await)?;
		Ok(())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Rename a world
#[napi]
pub async fn worlds_rename(
	instance_id: String,
	old_name: String,
	new_name: String,
) -> napi::Result<()> {
	let handle = runtime().spawn(async move {
		let path = std::path::Path::new(&instance_id);
		map_theseus(theseus::worlds::rename_world(path, &old_name, &new_name).await)?;
		Ok(())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Set world display status (normal/hidden/favorite)
#[napi]
pub async fn worlds_set_display_status(
	instance_id: String,
	world_type: String,
	world_id: String,
	status: String,
) -> napi::Result<()> {
	let handle = runtime().spawn(async move {
		let wt = theseus::worlds::WorldType::from_string(&world_type);
		let s = theseus::worlds::DisplayStatus::from_string(&status);
		map_theseus(
			theseus::worlds::set_world_display_status(&instance_id, wt, &world_id, s).await,
		)?;
		Ok(())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}
