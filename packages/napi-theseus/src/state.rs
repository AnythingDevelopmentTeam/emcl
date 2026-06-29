use crate::runtime;

/// Initialize the theseus state. Must be called before any other operation.
/// Takes the app identifier (e.g. "com.modrinth.ModrinthApp").
#[napi]
pub async fn init_state(app_identifier: String) -> napi::Result<()> {
	let handle = runtime().spawn(async move {
		theseus::EventState::init().await.map_err(|e| format!("{e}"))?;
		theseus::State::init(app_identifier).await.map_err(|e| format!("{e}"))
	});
	handle.await
		.map_err(|e| napi::Error::from_reason(format!("Task failed: {e}")))?
		.map_err(|e| napi::Error::from_reason(e))
}
