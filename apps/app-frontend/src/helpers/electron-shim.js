import { invoke } from '@tauri-apps/api/core'

function makeShim() {
	const api = {}

	function cmd(plugin, command) {
		const fullCmd = `plugin:${plugin}|${command}`
		return (...args) => {
			const obj = {}
			if (args.length > 1 || (args.length === 1 && typeof args[0] !== 'object')) {
				return invoke(fullCmd, ...args)
			}
			if (args.length === 1 && typeof args[0] === 'object') {
				return invoke(fullCmd, args[0])
			}
			return invoke(fullCmd, ...args)
		}
	}

	function simple(plugin, command) {
		const fullCmd = `plugin:${plugin}|${command}`
		return (...args) => {
			if (args.length === 0) return invoke(fullCmd)
			if (args.length === 1 && typeof args[0] !== 'object') return invoke(fullCmd, { [command.replace(/^[a-z]+_/, '')]: args[0] })
			return invoke(fullCmd, ...args)
		}
	}

	function direct(name) {
		return (...args) => invoke(name, args.length > 1 || (args.length === 1 && typeof args[0] === 'object') ? args[0] : undefined)
	}

	api.authCheckReachable = cmd('auth', 'check_reachable')
	api.authLogin = cmd('auth', 'login')
	api.authCreateOffline = (username) => invoke('plugin:auth|create_offline', { username })
	api.authGetDefaultUser = cmd('auth', 'get_default_user')
	api.authSetDefaultUser = (user) => invoke('plugin:auth|set_default_user', { user })
	api.authRemoveUser = (user) => invoke('plugin:auth|remove_user', { user })
	api.authGetUsers = cmd('auth', 'get_users')

	api.mrAuthGet = cmd('mr-auth', 'get')
	api.mrAuthLogin = cmd('mr-auth', 'modrinth_login')
	api.mrAuthLogout = cmd('mr-auth', 'logout')

	api.initState = () => invoke('initialize_state')

	api.settingsGet = cmd('settings', 'settings_get')
	api.settingsSet = (settings) => invoke('plugin:settings|settings_set', { settings })
	api.settingsCancelDirectoryChange = (_appId) => cmd('settings', 'cancel_directory_change')()

	api.instanceRemove = (id) => invoke('plugin:instance|instance_remove', { instanceId: id })
	api.instanceGet = (id) => invoke('plugin:instance|instance_get', { instanceId: id })
	api.instanceGetMany = (ids) => invoke('plugin:instance|instance_get_many', { instanceIds: ids })
	api.instanceGetProjects = (id) => invoke('plugin:instance|instance_get_projects', { instanceId: id })
	api.instanceGetOptimalJreKey = (id) => invoke('plugin:instance|instance_get_optimal_jre_key', { instanceId: id })
	api.instanceList = cmd('instance', 'instance_list')
	api.instanceCheckInstalled = (id, projectId) => invoke('plugin:instance|instance_check_installed', { instanceId: id, projectId })
	api.instanceToggleDisableProject = (id, path, enabled) => invoke('plugin:instance|instance_toggle_disable_project', { instanceId: id, projectPath: path, desiredEnabled: enabled })
	api.instanceExportMrpack = (id, loc, overrides, verId, desc, name) => invoke('plugin:instance|instance_export_mrpack', { instanceId: id, exportLocation: loc, includedOverrides: overrides, versionId: verId, description: desc, name })
	api.instanceRun = (id) => invoke('plugin:instance|instance_run', { instanceId: id })
	api.instanceKill = (id) => invoke('plugin:instance|instance_kill', { instanceId: id })
	api.instanceEdit = (id, editStr) => invoke('plugin:instance|instance_edit', { instanceId: id, editInstance: JSON.parse(editStr) })
	api.instanceEditIcon = (id, iconPath) => invoke('plugin:instance|instance_edit_icon', { instanceId: id, iconPath })

	api.installCreateInstance = (name, gameVer, loader, loaderVer, iconPath, link) => invoke('plugin:install|install_create_instance', {
		request: { name, gameVersion: gameVer, loader, loaderVersion: loaderVer, iconPath, link: link ? JSON.parse(link) : null }
	})
	api.installJobList = (includeFinished) => invoke('plugin:install|install_job_list', { includeFinished })
	api.installJobGet = (jobId) => invoke('plugin:install|install_job_get', { jobId })
	api.installJobRetry = (jobId) => invoke('plugin:install|install_job_retry', { jobId })
	api.installJobCancel = (jobId) => invoke('plugin:install|install_job_cancel', { jobId })
	api.installJobDismiss = (jobId) => invoke('plugin:install|install_job_dismiss', { jobId })

	api.cacheGetProject = (id, behaviour) => invoke('plugin:cache|get_project', { id, cacheBehaviour: behaviour })
	api.cacheGetProjectMany = (ids, behaviour) => invoke('plugin:cache|get_project_many', { ids, cacheBehaviour: behaviour })
	api.cacheGetVersion = (id, behaviour) => invoke('plugin:cache|get_version', { id, cacheBehaviour: behaviour })
	api.cacheGetVersionMany = (ids, behaviour) => invoke('plugin:cache|get_version_many', { ids, cacheBehaviour: behaviour })
	api.cacheGetUser = (id, behaviour) => invoke('plugin:cache|get_user', { id, cacheBehaviour: behaviour })
	api.cacheGetUserMany = (ids, behaviour) => invoke('plugin:cache|get_user_many', { ids, cacheBehaviour: behaviour })
	api.cacheGetTeam = (id, behaviour) => invoke('plugin:cache|get_team', { id, cacheBehaviour: behaviour })
	api.cacheGetTeamMany = (ids, behaviour) => invoke('plugin:cache|get_team_many', { ids, cacheBehaviour: behaviour })
	api.cacheGetSearchResults = (id, behaviour) => invoke('plugin:cache|get_search_results', { id, cacheBehaviour: behaviour })
	api.cachePurgeTypes = (types) => invoke('plugin:cache|purge_cache_types', { cacheTypes: types })

	api.logsGetLogs = (id, clear) => invoke('plugin:logs|logs_get_logs', { instanceId: id, clearContents: clear })
	api.logsGetByFilename = (id, type, filename) => invoke('plugin:logs|logs_get_logs_by_filename', { instanceId: id, logType: type, filename })
	api.logsDeleteLogs = (id) => invoke('plugin:logs|logs_delete_logs', { instanceId: id })
	api.logsGetLatestLogCursor = (id, cursor) => invoke('plugin:logs|logs_get_latest_log_cursor', { instanceId: id, cursor })
	api.logsGetLiveLogBuffer = (id) => invoke('plugin:logs|logs_get_live_log_buffer', { instanceId: id })
	api.logsClearLiveLogBuffer = (id) => invoke('plugin:logs|logs_clear_live_log_buffer', { instanceId: id })

	api.processGetByInstanceId = (id) => invoke('plugin:process|process_get_by_instance_id', { instanceId: id })
	api.processGetAll = cmd('process', 'process_get_all')
	api.processKill = (uuid) => invoke('plugin:process|process_kill', { uuid })

	api.jreGetJavaVersions = cmd('jre', 'get_java_versions')
	api.jreSetJavaVersion = (ver) => invoke('plugin:jre|set_java_version', { javaVersion: JSON.parse(ver) })
	api.jreAutoInstallJava = (ver) => invoke('plugin:jre|jre_auto_install_java', { javaVersion: ver })
	api.jreGetMaxMemory = cmd('jre', 'jre_get_max_memory')

	api.skinsGetAvailableCapes = cmd('minecraft-skins', 'get_available_capes')
	api.skinsGetAvailableSkins = cmd('minecraft-skins', 'get_available_skins')
	api.skinsSaveCustomSkin = (textureBlob, variant, cape) => invoke('plugin:minecraft-skins|add_and_equip_custom_skin', { textureBlob, variant, cape })
	api.skinsEquipSkin = (skinStr) => invoke('plugin:minecraft-skins|equip_skin', { skin: JSON.parse(skinStr) })
	api.skinsRemoveCustomSkin = (skinStr) => invoke('plugin:minecraft-skins|remove_custom_skin', { skin: JSON.parse(skinStr) })
	api.skinsUnequipSkin = cmd('minecraft-skins', 'unequip_skin')
	api.skinsFlushPendingSkinChange = cmd('minecraft-skins', 'flush_pending_skin_change')

	api.worldsGetRecent = (limit, statuses) => invoke('plugin:worlds|get_recent_worlds', { limit, displayStatuses: statuses })
	api.worldsGetInstanceWorlds = (id) => invoke('plugin:worlds|get_instance_worlds', { instanceId: id })
	api.worldsSetDisplayStatus = (inst, type, id, status) => invoke('plugin:worlds|set_world_display_status', { instance: inst, worldType: type, worldId: id, displayStatus: status })
	api.worldsRename = (inst, world, name) => invoke('plugin:worlds|rename_world', { instance: inst, world, newName: name })
	api.worldsBackup = (inst, world) => invoke('plugin:worlds|backup_world', { instance: inst, world })
	api.worldsDelete = (inst, world) => invoke('plugin:worlds|delete_world', { instance: inst, world })

	api.friendsList = cmd('friends', 'friends')
	api.friendsStatuses = cmd('friends', 'friend_statuses')
	api.friendsAdd = (userId) => invoke('plugin:friends|add_friend', { userId })
	api.friendsRemove = (userId) => invoke('plugin:friends|remove_friend', { userId })

	api.utilsIsDev = direct('is_dev')
	api.utilsAreUpdatesEnabled = direct('are_updates_enabled')
	api.utilsGetOs = cmd('utils', 'get_os')
	api.utilsIsNetworkMetered = cmd('utils', 'is_network_metered')
	api.utilsProgressBarsList = cmd('utils', 'progress_bars_list')

	api.openerOpenPath = (path) => invoke('plugin:opener|open_path', { path })
	api.openerShowItemInFolder = (path) => invoke('plugin:opener|show_item_in_folder', { path })
	api.openerOpenUrl = (url) => invoke('plugin:opener|open_url', { url })

	api.dialogOpen = (options) => invoke('plugin:dialog|open', { options })
	api.dialogSave = (options) => invoke('plugin:dialog|save', { options })

	return api
}

if (!window.electronAPI) {
	window.electronAPI = makeShim()
}
