#[macro_use]
extern crate napi_derive;

use napi::bindgen_prelude::*;
use std::sync::OnceLock;
use tokio::runtime::Runtime;

mod state;
pub use state::*;

mod auth;
pub use auth::*;

mod mr_auth;
pub use mr_auth::*;

mod instance;
pub use instance::*;

mod install;
pub use install::*;

mod settings;
pub use settings::*;

mod jre;
pub use jre::*;

mod process;
pub use process::*;

mod utils;
pub use utils::*;

mod cache;
pub use cache::*;

mod friends;
pub use friends::*;

mod logs;
pub use logs::*;

mod metadata;
pub use metadata::*;

mod tags;
pub use tags::*;

mod worlds;
pub use worlds::*;

mod skins;
pub use skins::*;

mod files;
pub use files::*;

mod error;
pub use error::*;

static RUNTIME: OnceLock<Runtime> = OnceLock::new();

pub(crate) fn runtime() -> &'static Runtime {
	RUNTIME.get_or_init(|| {
		Runtime::new().expect("Failed to create Tokio runtime for napi-theseus")
	})
}
