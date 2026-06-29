import type { Hooks, MemorySettings, WindowSize } from '@/helpers/types'
import type { ColorTheme, FeatureFlag } from '@/store/theme.ts'

export type AppSettings = {
	max_concurrent_downloads: number
	max_concurrent_writes: number

	theme: ColorTheme
	locale: string
	default_page: 'home' | 'library'
	collapsed_navigation: boolean
	hide_nametag_skins_page: boolean
	advanced_rendering: boolean
	native_decorations: boolean
	toggle_sidebar: boolean

	telemetry: boolean
	discord_rpc: boolean
	personalized_ads: boolean

	onboarded: boolean

	extra_launch_args: string[]
	custom_env_vars: [string, string][]
	memory: MemorySettings
	force_fullscreen: boolean
	game_resolution: WindowSize
	hide_on_process_start: boolean
	hooks: Hooks

	custom_dir?: string | null
	prev_custom_dir?: string | null
	migrated: boolean

	developer_mode: boolean
	feature_flags: Record<FeatureFlag, boolean>

	skipped_update: string | null
	pending_update_toast_for_version: string | null
	auto_download_updates: boolean | null

	version: number
}

// Get full settings object
export async function get() {
	try {
		return await window.electronAPI.settingsGet() as AppSettings
	} catch {
		return null
	}
}

// Set full settings object
export async function set(settings: AppSettings) {
	try {
		return await window.electronAPI.settingsSet(settings)
	} catch {
		// ignore
	}
}

export async function cancel_directory_change(): Promise<void> {
	return await window.electronAPI.settingsCancelDirectoryChange('modrinth-app')
}
