use crate::error::map_theseus;
use crate::runtime;

/// Check if Minecraft authentication servers are reachable
#[napi]
pub async fn auth_check_reachable() -> napi::Result<()> {
	let handle = runtime()
		.spawn(async move {
			map_theseus(theseus::minecraft_auth::check_reachable().await)?;
			Ok(())
		});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Begin the Microsoft OAuth login flow.
/// Returns the auth URL and device code for the user to complete in browser.
#[napi]
pub async fn auth_begin_login() -> napi::Result<serde_json::Value> {
	let handle = runtime()
		.spawn(async move {
			let flow = theseus::minecraft_auth::begin_login()
				.await
				.map_err(|e| napi::Error::from_reason(format!("{e}")))?;
			Ok(serde_json::to_value(&flow).unwrap_or_default())
		});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Finish the Microsoft OAuth login flow with the authorization code.
#[napi]
pub async fn auth_finish_login(
	code: String,
	flow_json: String,
) -> napi::Result<serde_json::Value> {
	let handle = runtime()
		.spawn(async move {
			let flow: theseus::data::MinecraftLoginFlow =
				serde_json::from_str(&flow_json)
					.map_err(|e| napi::Error::from_reason(format!("Invalid flow JSON: {e}")))?;

			let creds =
				map_theseus(theseus::minecraft_auth::finish_login(&code, flow).await)?;
			Ok(serde_json::to_value(&creds).unwrap_or_default())
		});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get the default (active) Minecraft user UUID
#[napi]
pub async fn auth_get_default_user() -> napi::Result<Option<String>> {
	let handle = runtime()
		.spawn(async move {
			map_theseus(theseus::minecraft_auth::get_default_user().await)
		});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
		.map(|uuid| uuid.map(|u| u.to_string()))
}

/// Set the default (active) Minecraft user
#[napi]
pub async fn auth_set_default_user(user: String) -> napi::Result<()> {
	let uuid = uuid::Uuid::parse_str(&user)
		.map_err(|e| napi::Error::from_reason(format!("Invalid UUID: {e}")))?;
	let handle = runtime()
		.spawn(async move {
			map_theseus(theseus::minecraft_auth::set_default_user(uuid).await)?;
			Ok(())
		});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Remove a Minecraft user account
#[napi]
pub async fn auth_remove_user(user: String) -> napi::Result<()> {
	let uuid = uuid::Uuid::parse_str(&user)
		.map_err(|e| napi::Error::from_reason(format!("Invalid UUID: {e}")))?;
	let handle = runtime()
		.spawn(async move {
			map_theseus(theseus::minecraft_auth::remove_user(uuid).await)?;
			Ok(())
		});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get all Minecraft user credentials
#[napi]
pub async fn auth_get_users() -> napi::Result<Vec<serde_json::Value>> {
	let handle = runtime()
		.spawn(async move {
			let users = map_theseus(theseus::minecraft_auth::users().await)?;
			Ok(users
				.into_iter()
				.map(|u| serde_json::to_value(&u).unwrap_or_default())
				.collect())
		});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Create an offline Minecraft account with the given username.
/// This generates a UUID from the username (offline-mode style)
/// and stores it without Microsoft authentication.
#[napi]
pub async fn auth_create_offline(username: String) -> napi::Result<serde_json::Value> {
	let handle = runtime()
		.spawn(async move {
			let creds = map_theseus(
				theseus::minecraft_auth::create_offline(&username).await,
			)?;
			Ok(serde_json::to_value(&creds).unwrap_or_default())
		});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}
