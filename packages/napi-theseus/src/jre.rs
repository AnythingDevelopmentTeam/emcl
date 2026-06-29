use crate::error::map_theseus;
use crate::runtime;

/// Get installed Java versions
#[napi]
pub async fn jre_get_java_versions() -> napi::Result<Vec<serde_json::Value>> {
	let handle = runtime().spawn(async move {
		let versions = map_theseus(theseus::jre::get_java_versions().await)?;
		Ok(versions
			.into_iter()
			.map(|(_, v)| serde_json::to_value(&v).unwrap_or_default())
			.collect())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Set Java version for an instance
#[napi]
pub async fn jre_set_java_version(version_json: String) -> napi::Result<()> {
	let handle = runtime().spawn(async move {
		let version: theseus::data::JavaVersion = serde_json::from_str(&version_json)
			.map_err(|e| napi::Error::from_reason(format!("Invalid JavaVersion JSON: {e}")))?;
		map_theseus(theseus::jre::set_java_version(version).await)?;
		Ok(())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Auto-install a Java version
#[napi]
pub async fn jre_auto_install_java(version: i32) -> napi::Result<()> {
	let handle = runtime().spawn(async move {
		map_theseus(theseus::jre::auto_install_java(version as u32).await)?;
		Ok(())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get max available memory
#[napi]
pub async fn jre_get_max_memory() -> napi::Result<i64> {
	let handle = runtime().spawn(async move {
		let m = map_theseus(theseus::jre::get_max_memory().await)?;
		Ok(m as i64)
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}
