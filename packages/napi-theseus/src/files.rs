use crate::error::map_theseus;
use crate::runtime;
use napi::bindgen_prelude::*;

/// Read a dragged/selected file as bytes
#[napi]
pub async fn file_read(path: String) -> napi::Result<Buffer> {
	let data = tokio::fs::read(&path)
		.await
		.map_err(|e| napi::Error::from_reason(format!("Failed to read file: {e}")))?;
	Ok(Buffer::from(data))
}
