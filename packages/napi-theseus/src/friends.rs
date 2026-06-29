use crate::error::map_theseus;
use crate::runtime;

/// Get friends list
#[napi]
pub async fn friends_list() -> napi::Result<Vec<serde_json::Value>> {
	runtime()
		.spawn(async move {
			let friends = map_theseus(theseus::friends::friends().await)?;
			Ok(friends
				.into_iter()
				.map(|f| serde_json::to_value(&f).unwrap_or_default())
				.collect())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Get friend online statuses
#[napi]
pub async fn friends_statuses() -> napi::Result<serde_json::Value> {
	runtime()
		.spawn(async move {
			let statuses = map_theseus(theseus::friends::friend_statuses().await)?;
			Ok(serde_json::to_value(&statuses).unwrap_or_default())
		})
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Add a friend
#[napi]
pub async fn friends_add(user_id: String) -> napi::Result<()> {
	runtime()
		.spawn(async move { map_theseus(theseus::friends::add_friend(&user_id).await) })
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}

/// Remove a friend
#[napi]
pub async fn friends_remove(user_id: String) -> napi::Result<()> {
	runtime()
		.spawn(async move { map_theseus(theseus::friends::remove_friend(&user_id).await) })
		.await
		.map_err(|e| napi::Error::from_reason(format!("{e}")))?
}
