use napi::bindgen_prelude::*;

pub(crate) fn to_napi_err(e: impl std::fmt::Display) -> napi::Error {
	napi::Error::from_reason(e.to_string())
}

pub(crate) fn from_theseus(e: theseus::Error) -> napi::Error {
	napi::Error::from_reason(e.to_string())
}

pub(crate) fn map_theseus<T>(r: theseus::Result<T>) -> napi::Result<T> {
	r.map_err(from_theseus)
}
