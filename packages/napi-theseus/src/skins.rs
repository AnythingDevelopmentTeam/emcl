use crate::error::map_theseus;
use crate::runtime;
use napi::bindgen_prelude::*;

/// Get available capes
#[napi]
pub async fn skins_get_available_capes() -> napi::Result<Vec<serde_json::Value>> {
	let handle = runtime().spawn(async move {
		let capes = map_theseus(theseus::minecraft_skins::get_available_capes().await)?;
		Ok(capes
			.into_iter()
			.map(|c| serde_json::to_value(&c).unwrap_or_default())
			.collect())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get available skins
#[napi]
pub async fn skins_get_available_skins() -> napi::Result<Vec<serde_json::Value>> {
	let handle = runtime().spawn(async move {
		let skins = map_theseus(theseus::minecraft_skins::get_available_skins().await)?;
		Ok(skins
			.into_iter()
			.map(|s| serde_json::to_value(&s).unwrap_or_default())
			.collect())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Equip a skin
#[napi]
pub async fn skins_equip_skin(skin_json: String) -> napi::Result<()> {
	let handle = runtime().spawn(async move {
		let skin: theseus::minecraft_skins::Skin = serde_json::from_str(&skin_json)
			.map_err(|e| napi::Error::from_reason(format!("Invalid skin JSON: {e}")))?;
		map_theseus(theseus::minecraft_skins::equip_skin(skin).await)?;
		Ok(())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Unequip current skin
#[napi]
pub async fn skins_unequip_skin() -> napi::Result<()> {
	let handle = runtime().spawn(async move {
		map_theseus(theseus::minecraft_skins::unequip_skin().await)?;
		Ok(())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Remove a custom skin
#[napi]
pub async fn skins_remove_custom_skin(skin_json: String) -> napi::Result<()> {
	let handle = runtime().spawn(async move {
		let skin: theseus::minecraft_skins::Skin = serde_json::from_str(&skin_json)
			.map_err(|e| napi::Error::from_reason(format!("Invalid skin JSON: {e}")))?;
		map_theseus(theseus::minecraft_skins::remove_custom_skin(skin).await)?;
		Ok(())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Save a custom skin
#[napi]
pub async fn skins_save_custom_skin(
	skin_json: String,
	texture_blob: Buffer,
	variant: String,
	cape_json: Option<String>,
	replace_texture: bool,
) -> napi::Result<serde_json::Value> {
	let handle = runtime().spawn(async move {
		let skin: theseus::minecraft_skins::Skin = serde_json::from_str(&skin_json)
			.map_err(|e| napi::Error::from_reason(format!("Invalid skin JSON: {e}")))?;
		let blob = bytes::Bytes::copy_from_slice(&texture_blob);
		let mv: theseus::minecraft_skins::MinecraftSkinVariant =
			serde_json::from_str(&format!("\"{variant}\""))
				.map_err(|e| napi::Error::from_reason(format!("Invalid variant: {e}")))?;
		let cape: Option<theseus::minecraft_skins::Cape> = match cape_json {
			Some(j) => Some(serde_json::from_str(&j)
				.map_err(|e| napi::Error::from_reason(format!("Invalid cape JSON: {e}")))?),
			None => None,
		};
		let result = map_theseus(
			theseus::minecraft_skins::save_custom_skin(skin, blob, mv, cape, replace_texture)
				.await,
		)?;
		Ok(serde_json::to_value(&result).unwrap_or_default())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Flush pending skin change
#[napi]
pub async fn skins_flush_pending_skin_change() -> napi::Result<()> {
	let handle = runtime().spawn(async move {
		map_theseus(theseus::minecraft_skins::flush_pending_skin_change().await)?;
		Ok(())
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}
