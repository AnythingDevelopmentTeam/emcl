import { contextBridge, ipcRenderer } from 'electron';

ipcRenderer.setMaxListeners(100);

const electronAPI = {
	// State
	initState: (appIdentifier: string) => ipcRenderer.invoke('state:init', appIdentifier),
	isStateInitialized: () => ipcRenderer.invoke('state:is_initialized'),

	// Auth - Minecraft
	authCheckReachable: () => ipcRenderer.invoke('auth:check_reachable'),
	authBeginLogin: () => ipcRenderer.invoke('auth:begin_login'),
	authFinishLogin: (code: string, flowJson: string) =>
		ipcRenderer.invoke('auth:finish_login', code, flowJson),
	authLogin: () => ipcRenderer.invoke('auth:login'),
	authGetDefaultUser: () => ipcRenderer.invoke('auth:get_default_user'),
	authSetDefaultUser: (user: string) => ipcRenderer.invoke('auth:set_default_user', user),
	authRemoveUser: (user: string) => ipcRenderer.invoke('auth:remove_user', user),
	authGetUsers: () => ipcRenderer.invoke('auth:get_users'),
	authCreateOffline: (username: string) => ipcRenderer.invoke('auth:create_offline', username),

	// Auth - Modrinth
	mrAuthGet: () => ipcRenderer.invoke('mr-auth:get'),
	mrAuthLogout: () => ipcRenderer.invoke('mr-auth:logout'),

	// Instances
	instanceList: () => ipcRenderer.invoke('instance:list'),
	instanceGet: (id: string) => ipcRenderer.invoke('instance:get', id),
	instanceGetMany: (ids: string[]) => ipcRenderer.invoke('instance:get_many', ids),
	instanceRemove: (id: string) => ipcRenderer.invoke('instance:remove', id),
	instanceGetProjects: (id: string) => ipcRenderer.invoke('instance:get_projects', id),
	instanceRun: (id: string) => ipcRenderer.invoke('instance:run', id),
	instanceKill: (id: string) => ipcRenderer.invoke('instance:kill', id),
	instanceEdit: (id: string, metadata: any) => ipcRenderer.invoke('instance:edit', id, JSON.stringify(metadata)),
	instanceEditIcon: (id: string, iconPath?: string) => ipcRenderer.invoke('instance:edit_icon', id, iconPath),
	instanceCheckInstalled: (id: string, projectId: string) => ipcRenderer.invoke('instance:check_installed', id, projectId),
	instanceGetOptimalJreKey: (id: string) => ipcRenderer.invoke('instance:get_optimal_jre_key', id),
	instanceToggleDisableProject: (id: string, projectId: string, desiredEnabled?: boolean) =>
		ipcRenderer.invoke('instance:toggle_disable_project', id, projectId, desiredEnabled),
	instanceExportMrpack: (id: string, exportPath: string, candidates?: string[], versionId?: string, description?: string, name?: string) =>
		ipcRenderer.invoke('instance:export_mrpack', id, exportPath, candidates ?? [], versionId ?? null, description ?? null, name ?? null),

	// Install
	installCreateInstance: (name: string, gameVersion: string, loader: string, loaderVersion?: string, iconPath?: string, linkJson?: string) =>
		ipcRenderer.invoke('install:create_instance', name, gameVersion, loader, loaderVersion ?? null, iconPath ?? null, linkJson ?? null),
	installJobList: (includeFinished: boolean) => ipcRenderer.invoke('install:job_list', includeFinished),
	installJobGet: (jobId: string) => ipcRenderer.invoke('install:job_get', jobId),
	installJobRetry: (jobId: string) => ipcRenderer.invoke('install:job_retry', jobId),
	installJobCancel: (jobId: string) => ipcRenderer.invoke('install:job_cancel', jobId),
	installJobDismiss: (jobId: string) => ipcRenderer.invoke('install:job_dismiss', jobId),

	// Settings
	settingsGet: () => ipcRenderer.invoke('settings:get'),
	settingsSet: (settings: any) => ipcRenderer.invoke('settings:set', JSON.stringify(settings)),
	settingsCancelDirectoryChange: (appId: string) => ipcRenderer.invoke('settings:cancel_directory_change', appId),

	// JRE
	jreGetJavaVersions: () => ipcRenderer.invoke('jre:get_java_versions'),
	jreSetJavaVersion: (versionJson: string) => ipcRenderer.invoke('jre:set_java_version', versionJson),
	jreAutoInstallJava: (version: number) => ipcRenderer.invoke('jre:auto_install_java', version),
	jreGetMaxMemory: () => ipcRenderer.invoke('jre:get_max_memory'),

	// Process
	processGetByInstanceId: (instanceId: string) => ipcRenderer.invoke('process:get_by_instance_id', instanceId),
	processGetAll: () => ipcRenderer.invoke('process:get_all'),
	processKill: (processUuid: string) => ipcRenderer.invoke('process:kill', processUuid),

	// Utils
	utilsGetOs: () => ipcRenderer.invoke('utils:get_os'),
	utilsIsDev: () => ipcRenderer.invoke('utils:is_dev'),
	utilsAreUpdatesEnabled: () => ipcRenderer.invoke('utils:are_updates_enabled'),
	utilsIsNetworkMetered: () => ipcRenderer.invoke('utils:is_network_metered'),
	utilsProgressBarsList: () => ipcRenderer.invoke('utils:progress_bars_list'),

	// Cache
	cacheGetProject: (id: string, cacheBehaviour?: string) => ipcRenderer.invoke('cache:get_project', id, cacheBehaviour ?? null),
	cacheGetProjectMany: (ids: string[], cacheBehaviour?: string) => ipcRenderer.invoke('cache:get_project_many', ids, cacheBehaviour ?? null),
	cacheGetVersion: (id: string, cacheBehaviour?: string) => ipcRenderer.invoke('cache:get_version', id, cacheBehaviour ?? null),
	cacheGetVersionMany: (ids: string[], cacheBehaviour?: string) => ipcRenderer.invoke('cache:get_version_many', ids, cacheBehaviour ?? null),
	cacheGetUser: (id: string, cacheBehaviour?: string) => ipcRenderer.invoke('cache:get_user', id, cacheBehaviour ?? null),
	cacheGetUserMany: (ids: string[], cacheBehaviour?: string) => ipcRenderer.invoke('cache:get_user_many', ids, cacheBehaviour ?? null),
	cacheGetTeam: (id: string, cacheBehaviour?: string) => ipcRenderer.invoke('cache:get_team', id, cacheBehaviour ?? null),
	cacheGetTeamMany: (ids: string[], cacheBehaviour?: string) => ipcRenderer.invoke('cache:get_team_many', ids, cacheBehaviour ?? null),
	cacheGetSearchResults: (url: string, cacheBehaviour?: string) => ipcRenderer.invoke('cache:get_search_results', url, cacheBehaviour ?? null),
	cachePurgeTypes: (types: string[]) => ipcRenderer.invoke('cache:purge_types', types),

	// Friends
	friendsList: () => ipcRenderer.invoke('friends:list'),
	friendsStatuses: () => ipcRenderer.invoke('friends:statuses'),
	friendsAdd: (userId: string) => ipcRenderer.invoke('friends:add', userId),
	friendsRemove: (userId: string) => ipcRenderer.invoke('friends:remove', userId),

	// Logs
	logsGetLogs: (instanceId: string, clearContents?: boolean) => ipcRenderer.invoke('logs:get_logs', instanceId, clearContents ?? null),
	logsGetByFilename: (instanceId: string, logType: string, filename: string) =>
		ipcRenderer.invoke('logs:get_by_filename', instanceId, logType, filename),
	logsDeleteLogs: (instanceId: string) => ipcRenderer.invoke('logs:delete_logs', instanceId),
	logsGetLatestLogCursor: (instanceId: string, cursor: number) => ipcRenderer.invoke('logs:get_latest_log_cursor', instanceId, cursor),
	logsGetLiveLogBuffer: (instanceId: string) => ipcRenderer.invoke('logs:get_live_log_buffer', instanceId),
	logsClearLiveLogBuffer: (instanceId: string) => ipcRenderer.invoke('logs:clear_live_log_buffer', instanceId),

	// Metadata
	metadataGetMinecraftVersions: () => ipcRenderer.invoke('metadata:get_minecraft_versions'),
	metadataGetLoaderVersions: (loader: string) => ipcRenderer.invoke('metadata:get_loader_versions', loader),

	// Tags
	tagsGetCategories: () => ipcRenderer.invoke('tags:get_categories'),
	tagsGetLoaders: () => ipcRenderer.invoke('tags:get_loaders'),
	tagsGetGameVersions: () => ipcRenderer.invoke('tags:get_game_versions'),
	tagsGetDonationPlatforms: () => ipcRenderer.invoke('tags:get_donation_platforms'),
	tagsGetReportTypes: () => ipcRenderer.invoke('tags:get_report_types'),

	// Worlds
	worldsGetRecent: (limit: number, displayStatuses: string[]) => ipcRenderer.invoke('worlds:get_recent', limit, displayStatuses),
	worldsGetInstanceWorlds: (instanceId: string) => ipcRenderer.invoke('worlds:get_instance_worlds', instanceId),
	worldsDelete: (instanceId: string, worldName: string) => ipcRenderer.invoke('worlds:delete', instanceId, worldName),
	worldsBackup: (instanceId: string, worldName: string) => ipcRenderer.invoke('worlds:backup', instanceId, worldName),
	worldsRename: (instanceId: string, oldName: string, newName: string) =>
		ipcRenderer.invoke('worlds:rename', instanceId, oldName, newName),
	worldsSetDisplayStatus: (instanceId: string, worldType: string, worldId: string, status: string) =>
		ipcRenderer.invoke('worlds:set_display_status', instanceId, worldType, worldId, status),

	// Skins
	skinsGetAvailableCapes: () => ipcRenderer.invoke('skins:get_available_capes'),
	skinsGetAvailableSkins: () => ipcRenderer.invoke('skins:get_available_skins'),
	skinsEquipSkin: (skinJson: string) => ipcRenderer.invoke('skins:equip_skin', skinJson),
	skinsUnequipSkin: () => ipcRenderer.invoke('skins:unequip_skin'),
	skinsRemoveCustomSkin: (skinJson: string) => ipcRenderer.invoke('skins:remove_custom_skin', skinJson),
	skinsSaveCustomSkin: (skinJson: string, textureBlob: ArrayBuffer, variant: string, capeJson?: string, replaceTexture?: boolean) =>
		ipcRenderer.invoke('skins:save_custom_skin', skinJson, Buffer.from(textureBlob), variant, capeJson ?? null, replaceTexture ?? false),
	skinsFlushPendingSkinChange: () => ipcRenderer.invoke('skins:flush_pending_skin_change'),

	// Files
	fileRead: (filePath: string) => ipcRenderer.invoke('file:read', filePath),

	// Dialogs (Electron native)
	dialogOpen: (options?: any) => ipcRenderer.invoke('dialog:open', options ?? {}),
	dialogSave: (options?: any) => ipcRenderer.invoke('dialog:save', options ?? {}),

	// Window
	windowMinimize: () => ipcRenderer.invoke('window:minimize'),
	windowMaximize: () => ipcRenderer.invoke('window:maximize'),
	windowClose: () => ipcRenderer.invoke('window:close'),
	windowIsMaximized: () => ipcRenderer.invoke('window:is_maximized'),
	windowSetDecorations: (decorated: boolean) => ipcRenderer.invoke('window:set_decorations', decorated),

	// Opener
	openerOpenUrl: (url: string) => ipcRenderer.invoke('opener:open_url', url),
	openerOpenPath: (filePath: string) => ipcRenderer.invoke('opener:open_path', filePath),
	openerShowItemInFolder: (filePath: string) => ipcRenderer.invoke('opener:show_item_in_folder', filePath),

	// App
	getAppVersion: () => ipcRenderer.invoke('app:get_version'),

	// Events (from main process)
	onCommand: (callback: (payload: any) => void) => {
		const handler = (_e: any, payload: any) => callback(payload);
		ipcRenderer.on('command', handler);
		return () => { ipcRenderer.removeListener('command', handler); };
	},
	onNotification: (callback: (payload: any) => void) => {
		const handler = (_e: any, payload: any) => callback(payload);
		ipcRenderer.on('notification', handler);
		return () => { ipcRenderer.removeListener('notification', handler); };
	},
	onWindowResized: (callback: () => void) => {
		ipcRenderer.on('window-resized', () => callback());
		return () => { ipcRenderer.removeAllListeners('window-resized'); };
	},
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
