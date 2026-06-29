import { install_import_instance } from './install'

export async function get_importable_instances(launcherType, basePath) {
	throw new Error('Import from other launchers not implemented in Electron build')
}

export async function import_instance(launcherType, basePath, instanceFolder) {
	return await install_import_instance(launcherType, basePath, instanceFolder)
}

export async function is_valid_importable_instance(instanceFolder, launcherType) {
	throw new Error('Import validation not implemented in Electron build')
}

export async function get_default_launcher_path(launcherType) {
	throw new Error('Default launcher path not implemented in Electron build')
}
