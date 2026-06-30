function makeShim() {
	let invoke = null
	const api = {}

	async function ensureInvoke() {
		if (invoke) return
		const core = await import('@tauri-apps/api/core')
		invoke = core.invoke
	}

	async function lazyInvoke(...args) {
		await ensureInvoke()
		return invoke(...args)
	}

	function cmd(plugin, command) {
		const fullCmd = `plugin:${plugin}|${command}`
		return (...args) => {
			const obj = {}
			if (args.length > 1 || (args.length === 1 && typeof args[0] !== 'object')) {
				return lazyInvoke(fullCmd, ...args)
			}
			if (args.length === 1 && typeof args[0] === 'object') {
				return lazyInvoke(fullCmd, args[0])
			}
			return lazyInvoke(fullCmd, ...args)
		}
	}

	function simple(plugin, command) {
		const fullCmd = `plugin:${plugin}|${command}`
		return (...args) => {
			if (args.length === 0) return lazyInvoke(fullCmd)
			if (args.length === 1 && typeof args[0] !== 'object') return lazyInvoke(fullCmd, { [command.replace(/^[a-z]+_/, '')]: args[0] })
			return lazyInvoke(fullCmd, ...args)
		}
	}

	function direct(name) {
		return (...args) => lazyInvoke(name, args.length > 1 || (args.length === 1 && typeof args[0] === 'object') ? args[0] : undefined)
	}

	api.authCheckReachable = cmd('auth', 'check_reachable')
	api.authLogin = cmd('auth', 'login')
	api.authCreateOffline = (username) => lazyInvoke('plugin:auth|create_offline', { username })
	api.authGetDefaultUser = cmd('auth', 'get_default_user')
	api.authSetDefaultUser = (user) => lazyInvoke('plugin:auth|set_default_user', { user })
	api.authRemoveUser = (user) => lazyInvoke('plugin:auth|remove_user', { user })
	api.authGetUsers = cmd('auth', 'get_users')

	api.mrAuthGet = cmd('mr-auth', 'get')
	api.mrAuthLogin = cmd('mr-auth', 'modrinth_login')
	api.mrAuthLogout = cmd('mr-auth', 'logout')

	api.initState = () => lazyInvoke('initialize_state')

	api.settingsGet = cmd('settings', 'settings_get')
	api.settingsSet = (settings) => lazyInvoke('plugin:settings|settings_set', { settings })
	api.settingsCancelDirectoryChange = (_appId) => cmd('settings', 'cancel_directory_change')()

	api.instanceRemove = (id) => lazyInvoke('plugin:instance|instance_remove', { instanceId: id })
	api.instanceGet = (id) => lazyInvoke('plugin:instance|instance_get', { instanceId: id })
	api.instanceGetMany = (ids) => lazyInvoke('plugin:instance|instance_get_many', { instanceIds: ids })
	api.instanceGetProjects = (id) => lazyInvoke('plugin:instance|instance_get_projects', { instanceId: id })
	api.instanceGetOptimalJreKey = (id) => lazyInvoke('plugin:instance|instance_get_optimal_jre_key', { instanceId: id })
	api.instanceList = cmd('instance', 'instance_list')
	api.instanceCheckInstalled = (id, projectId) => lazyInvoke('plugin:instance|instance_check_installed', { instanceId: id, projectId })
	api.instanceToggleDisableProject = (id, path, enabled) => lazyInvoke('plugin:instance|instance_toggle_disable_project', { instanceId: id, projectPath: path, desiredEnabled: enabled })
	api.instanceExportMrpack = (id, loc, overrides, verId, desc, name) => lazyInvoke('plugin:instance|instance_export_mrpack', { instanceId: id, exportLocation: loc, includedOverrides: overrides, versionId: verId, description: desc, name })
	api.instanceRun = (id) => lazyInvoke('plugin:instance|instance_run', { instanceId: id })
	api.instanceKill = (id) => lazyInvoke('plugin:instance|instance_kill', { instanceId: id })
	api.instanceEdit = (id, editStr) => lazyInvoke('plugin:instance|instance_edit', { instanceId: id, editInstance: JSON.parse(editStr) })
	api.instanceEditIcon = (id, iconPath) => lazyInvoke('plugin:instance|instance_edit_icon', { instanceId: id, iconPath })

	api.installCreateInstance = (name, gameVer, loader, loaderVer, iconPath, link) => lazyInvoke('plugin:install|install_create_instance', {
		request: { name, gameVersion: gameVer, loader, loaderVersion: loaderVer, iconPath, link: link ? JSON.parse(link) : null }
	})
	api.installJobList = (includeFinished) => lazyInvoke('plugin:install|install_job_list', { includeFinished })
	api.installJobGet = (jobId) => lazyInvoke('plugin:install|install_job_get', { jobId })
	api.installJobRetry = (jobId) => lazyInvoke('plugin:install|install_job_retry', { jobId })
	api.installJobCancel = (jobId) => lazyInvoke('plugin:install|install_job_cancel', { jobId })
	api.installJobDismiss = (jobId) => lazyInvoke('plugin:install|install_job_dismiss', { jobId })

	api.cacheGetProject = (id, behaviour) => lazyInvoke('plugin:cache|get_project', { id, cacheBehaviour: behaviour })
	api.cacheGetProjectMany = (ids, behaviour) => lazyInvoke('plugin:cache|get_project_many', { ids, cacheBehaviour: behaviour })
	api.cacheGetVersion = (id, behaviour) => lazyInvoke('plugin:cache|get_version', { id, cacheBehaviour: behaviour })
	api.cacheGetVersionMany = (ids, behaviour) => lazyInvoke('plugin:cache|get_version_many', { ids, cacheBehaviour: behaviour })
	api.cacheGetUser = (id, behaviour) => lazyInvoke('plugin:cache|get_user', { id, cacheBehaviour: behaviour })
	api.cacheGetUserMany = (ids, behaviour) => lazyInvoke('plugin:cache|get_user_many', { ids, cacheBehaviour: behaviour })
	api.cacheGetTeam = (id, behaviour) => lazyInvoke('plugin:cache|get_team', { id, cacheBehaviour: behaviour })
	api.cacheGetTeamMany = (ids, behaviour) => lazyInvoke('plugin:cache|get_team_many', { ids, cacheBehaviour: behaviour })
	api.cacheGetSearchResults = (id, behaviour) => lazyInvoke('plugin:cache|get_search_results', { id, cacheBehaviour: behaviour })
	api.cachePurgeTypes = (types) => lazyInvoke('plugin:cache|purge_cache_types', { cacheTypes: types })

	api.logsGetLogs = (id, clear) => lazyInvoke('plugin:logs|logs_get_logs', { instanceId: id, clearContents: clear })
	api.logsGetByFilename = (id, type, filename) => lazyInvoke('plugin:logs|logs_get_logs_by_filename', { instanceId: id, logType: type, filename })
	api.logsDeleteLogs = (id) => lazyInvoke('plugin:logs|logs_delete_logs', { instanceId: id })
	api.logsGetLatestLogCursor = (id, cursor) => lazyInvoke('plugin:logs|logs_get_latest_log_cursor', { instanceId: id, cursor })
	api.logsGetLiveLogBuffer = (id) => lazyInvoke('plugin:logs|logs_get_live_log_buffer', { instanceId: id })
	api.logsClearLiveLogBuffer = (id) => lazyInvoke('plugin:logs|logs_clear_live_log_buffer', { instanceId: id })

	api.processGetByInstanceId = (id) => lazyInvoke('plugin:process|process_get_by_instance_id', { instanceId: id })
	api.processGetAll = cmd('process', 'process_get_all')
	api.processKill = (uuid) => lazyInvoke('plugin:process|process_kill', { uuid })

	api.jreGetJavaVersions = cmd('jre', 'get_java_versions')
	api.jreSetJavaVersion = (ver) => lazyInvoke('plugin:jre|set_java_version', { javaVersion: JSON.parse(ver) })
	api.jreAutoInstallJava = (ver) => lazyInvoke('plugin:jre|jre_auto_install_java', { javaVersion: ver })
	api.jreGetMaxMemory = cmd('jre', 'jre_get_max_memory')

	api.skinsGetAvailableCapes = cmd('minecraft-skins', 'get_available_capes')
	api.skinsGetAvailableSkins = cmd('minecraft-skins', 'get_available_skins')
	api.skinsSaveCustomSkin = (textureBlob, variant, cape) => lazyInvoke('plugin:minecraft-skins|add_and_equip_custom_skin', { textureBlob, variant, cape })
	api.skinsEquipSkin = (skinStr) => lazyInvoke('plugin:minecraft-skins|equip_skin', { skin: JSON.parse(skinStr) })
	api.skinsRemoveCustomSkin = (skinStr) => lazyInvoke('plugin:minecraft-skins|remove_custom_skin', { skin: JSON.parse(skinStr) })
	api.skinsUnequipSkin = cmd('minecraft-skins', 'unequip_skin')
	api.skinsFlushPendingSkinChange = cmd('minecraft-skins', 'flush_pending_skin_change')

	api.worldsGetRecent = (limit, statuses) => lazyInvoke('plugin:worlds|get_recent_worlds', { limit, displayStatuses: statuses })
	api.worldsGetInstanceWorlds = (id) => lazyInvoke('plugin:worlds|get_instance_worlds', { instanceId: id })
	api.worldsSetDisplayStatus = (inst, type, id, status) => lazyInvoke('plugin:worlds|set_world_display_status', { instance: inst, worldType: type, worldId: id, displayStatus: status })
	api.worldsRename = (inst, world, name) => lazyInvoke('plugin:worlds|rename_world', { instance: inst, world, newName: name })
	api.worldsBackup = (inst, world) => lazyInvoke('plugin:worlds|backup_world', { instance: inst, world })
	api.worldsDelete = (inst, world) => lazyInvoke('plugin:worlds|delete_world', { instance: inst, world })

	api.friendsList = cmd('friends', 'friends')
	api.friendsStatuses = cmd('friends', 'friend_statuses')
	api.friendsAdd = (userId) => lazyInvoke('plugin:friends|add_friend', { userId })
	api.friendsRemove = (userId) => lazyInvoke('plugin:friends|remove_friend', { userId })

	api.utilsIsDev = direct('is_dev')
	api.utilsAreUpdatesEnabled = direct('are_updates_enabled')
	api.utilsGetOs = cmd('utils', 'get_os')
	api.utilsIsNetworkMetered = cmd('utils', 'is_network_metered')
	api.utilsProgressBarsList = cmd('utils', 'progress_bars_list')

	api.openerOpenPath = (path) => lazyInvoke('plugin:opener|open_path', { path })
	api.openerShowItemInFolder = (path) => lazyInvoke('plugin:opener|show_item_in_folder', { path })
	api.openerOpenUrl = (url) => lazyInvoke('plugin:opener|open_url', { url })

	api.dialogOpen = (options) => lazyInvoke('plugin:dialog|open', { options })
	api.dialogSave = (options) => lazyInvoke('plugin:dialog|save', { options })

	return api
}

if (!window.electronAPI) {
	window.electronAPI = makeShim()
}
