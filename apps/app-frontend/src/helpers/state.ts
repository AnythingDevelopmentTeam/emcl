export interface LoadingBarType {
	type?: string
	version?: string
	instance_id?: string
	instance_name?: string
	pack_name?: string
	icon?: string | null
}

export interface LoadingBar {
	id?: string | number
	loading_bar_uuid?: string | number
	title?: string
	message?: string
	current?: number
	total?: number
	bar_type?: LoadingBarType
}

export type OpeningCommandEvent =
	| 'RunMRPack'
	| 'InstallServer'
	| 'InstallVersion'
	| 'InstallMod'
	| 'InstallModpack'
	| string

export interface OpeningCommand {
	event: OpeningCommandEvent
	id?: string
	path?: string
}

// Initialize the theseus API state
// This should be called during the initializion/opening of the launcher
export async function initialize_state() {
	try {
		return await window.electronAPI.initState('modrinth-app')
	} catch {
		return null
	}
}

// Gets active progress bars
export async function progress_bars_list() {
	try {
		return await window.electronAPI.utilsProgressBarsList() as Record<string, LoadingBar>
	} catch {
		return {}
	}
}

// Get opening command
// This should be called once and only when the app is done booting up and ready to receive a command
export async function get_opening_command() {
	return null as OpeningCommand | null
}
