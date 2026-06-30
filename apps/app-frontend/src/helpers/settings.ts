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

const STORAGE_KEY = 'modrinth_app_settings'

const DEFAULT_SETTINGS: AppSettings = {
	max_concurrent_downloads: 5,
	max_concurrent_writes: 5,
	theme: 'dark' as ColorTheme,
	locale: 'en-US',
	default_page: 'home',
	collapsed_navigation: false,
	hide_nametag_skins_page: false,
	advanced_rendering: true,
	native_decorations: true,
	telemetry: false,
	discord_rpc: true,
	personalized_ads: false,
	onboarded: true,
	extra_launch_args: [],
	custom_env_vars: [],
	memory: { memory_override: false, memory_ceiling: 4096, memory_floor: 1024 },
	force_fullscreen: false,
	game_resolution: { width: 854, height: 480 },
	hide_on_process_start: false,
	hooks: { pre_launch: '', wrapper: '', post_exit: '' },
	custom_dir: null,
	prev_custom_dir: null,
	migrated: true,
	developer_mode: false,
	feature_flags: {
		worlds_tab: false,
		page_path: false,
		project_license_field: false,
		client_sidebar: true,
		breadcrumbs_redesign: true,
	},
	skipped_update: null,
	pending_update_toast_for_version: null,
	auto_download_updates: null,
	version: 1,
}

// Get full settings object
export async function get(): Promise<AppSettings | null> {
	try {
		const result = await window.electronAPI.settingsGet() as AppSettings | null
		if (result) return result
	} catch {
		// native backend unavailable, try localStorage
	}
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (raw) return JSON.parse(raw) as AppSettings
	} catch {
		// ignore
	}
	return DEFAULT_SETTINGS
}

// Set full settings object
export async function set(settings: AppSettings) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
	} catch {
		// ignore
	}
	try {
		return await window.electronAPI.settingsSet(settings)
	} catch {
		// ignore
	}
}

export async function cancel_directory_change(): Promise<void> {
	return await window.electronAPI.settingsCancelDirectoryChange('modrinth-app')
}
