interface NativeErrorPayload {
	method: string
	message: string
	stack: string
	args: string[]
	timestamp: number
}

interface ElectronAPI {
	// State
	initState: (appIdentifier: string) => Promise<void>
	isStateInitialized: () => Promise<boolean>

	// Auth - Minecraft
	authCheckReachable: () => Promise<void>
	authBeginLogin: () => Promise<string>
	authFinishLogin: (code: string, flowJson: string) => Promise<string>
	authLogin: () => Promise<string | null>
	authGetDefaultUser: () => Promise<string | null>
	authSetDefaultUser: (user: string) => Promise<void>
	authRemoveUser: (user: string) => Promise<void>
	authGetUsers: () => Promise<string>
	authCreateOffline: (username: string) => Promise<string>

	// Auth - Modrinth
	mrAuthGet: () => Promise<string | null>
	mrAuthLogout: () => Promise<void>

	// Instances
	instanceList: () => Promise<string>
	instanceGet: (id: string) => Promise<string>
	instanceGetMany: (ids: string[]) => Promise<string>
	instanceRemove: (id: string) => Promise<void>
	instanceGetProjects: (id: string) => Promise<string>
	instanceRun: (id: string) => Promise<void>
	instanceKill: (id: string) => Promise<void>
	instanceEdit: (id: string, metadata: string) => Promise<void>
	instanceEditIcon: (id: string, iconPath?: string) => Promise<void>
	instanceCheckInstalled: (id: string, projectId: string) => Promise<boolean>
	instanceGetOptimalJreKey: (id: string) => Promise<string | null>
	instanceToggleDisableProject: (id: string, projectId: string, desiredEnabled?: boolean) => Promise<void>
	instanceExportMrpack: (id: string, exportPath: string, candidates?: string[], versionId?: string, description?: string, name?: string) => Promise<string>

	// Install
	installCreateInstance: (name: string, gameVersion: string, loader: string, loaderVersion?: string, iconPath?: string, linkJson?: string) => Promise<string>
	installJobList: (includeFinished: boolean) => Promise<string>
	installJobGet: (jobId: string) => Promise<string>
	installJobRetry: (jobId: string) => Promise<void>
	installJobCancel: (jobId: string) => Promise<void>
	installJobDismiss: (jobId: string) => Promise<void>

	// Settings
	settingsGet: () => Promise<string>
	settingsSet: (settings: string) => Promise<void>
	settingsCancelDirectoryChange: (appId: string) => Promise<void>

	// JRE
	jreGetJavaVersions: () => Promise<string>
	jreSetJavaVersion: (versionJson: string) => Promise<void>
	jreAutoInstallJava: (version: number) => Promise<void>
	jreGetMaxMemory: () => Promise<number>

	// Process
	processGetByInstanceId: (instanceId: string) => Promise<string | null>
	processGetAll: () => Promise<string>
	processKill: (processUuid: string) => Promise<void>

	// Utils
	utilsGetOs: () => Promise<string>
	utilsIsDev: () => Promise<boolean>
	utilsAreUpdatesEnabled: () => Promise<boolean>
	utilsIsNetworkMetered: () => Promise<boolean>
	utilsProgressBarsList: () => Promise<string>

	// Cache
	cacheGetProject: (id: string, cacheBehaviour?: string) => Promise<string>
	cacheGetProjectMany: (ids: string[], cacheBehaviour?: string) => Promise<string>
	cacheGetVersion: (id: string, cacheBehaviour?: string) => Promise<string>
	cacheGetVersionMany: (ids: string[], cacheBehaviour?: string) => Promise<string>
	cacheGetUser: (id: string, cacheBehaviour?: string) => Promise<string>
	cacheGetUserMany: (ids: string[], cacheBehaviour?: string) => Promise<string>
	cacheGetTeam: (id: string, cacheBehaviour?: string) => Promise<string>
	cacheGetTeamMany: (ids: string[], cacheBehaviour?: string) => Promise<string>
	cacheGetSearchResults: (url: string, cacheBehaviour?: string) => Promise<string>
	cachePurgeTypes: (types: string[]) => Promise<void>

	// Friends
	friendsList: () => Promise<string>
	friendsStatuses: () => Promise<string>
	friendsAdd: (userId: string) => Promise<void>
	friendsRemove: (userId: string) => Promise<void>

	// Logs
	logsGetLogs: (instanceId: string, clearContents?: boolean) => Promise<string>
	logsGetByFilename: (instanceId: string, logType: string, filename: string) => Promise<string>
	logsDeleteLogs: (instanceId: string) => Promise<void>
	logsGetLatestLogCursor: (instanceId: string, cursor: number) => Promise<string>
	logsGetLiveLogBuffer: (instanceId: string) => Promise<string>
	logsClearLiveLogBuffer: (instanceId: string) => Promise<void>

	// Metadata
	metadataGetMinecraftVersions: () => Promise<string>
	metadataGetLoaderVersions: (loader: string) => Promise<string>

	// Tags
	tagsGetCategories: () => Promise<string>
	tagsGetLoaders: () => Promise<string>
	tagsGetGameVersions: () => Promise<string>
	tagsGetDonationPlatforms: () => Promise<string>
	tagsGetReportTypes: () => Promise<string>

	// Worlds
	worldsGetRecent: (limit: number, displayStatuses: string[]) => Promise<string>
	worldsGetInstanceWorlds: (instanceId: string) => Promise<string>
	worldsDelete: (instanceId: string, worldName: string) => Promise<void>
	worldsBackup: (instanceId: string, worldName: string) => Promise<void>
	worldsRename: (instanceId: string, oldName: string, newName: string) => Promise<void>
	worldsSetDisplayStatus: (instanceId: string, worldType: string, worldId: string, status: string) => Promise<void>

	// Skins
	skinsGetAvailableCapes: () => Promise<string>
	skinsGetAvailableSkins: () => Promise<string>
	skinsEquipSkin: (skinJson: string) => Promise<void>
	skinsUnequipSkin: () => Promise<void>
	skinsRemoveCustomSkin: (skinJson: string) => Promise<void>
	skinsSaveCustomSkin: (skinJson: string, textureBlob: ArrayBuffer, variant: string, capeJson?: string, replaceTexture?: boolean) => Promise<string>
	skinsFlushPendingSkinChange: () => Promise<void>
	skinsNormalizeTexture: (texture: string | Uint8Array) => Promise<Uint8Array>

	// Files
	fileRead: (filePath: string) => Promise<string>

	// Dialogs
	dialogOpen: (options?: any) => Promise<any>
	dialogSave: (options?: any) => Promise<any>

	// Window
	windowMinimize: () => void
	windowMaximize: () => void
	windowClose: () => void
	windowIsMaximized: () => Promise<boolean>
	windowSetDecorations: (decorated: boolean) => void

	// App version
	getAppVersion: () => Promise<string>

	// Window resize notification
	onWindowResized: (callback: () => void) => () => void

	// Opener
	openerOpenUrl: (url: string) => Promise<void>
	openerOpenPath: (filePath: string) => Promise<string>
	openerShowItemInFolder: (filePath: string) => void

	// Instance Mod Ops (Node.js fallback)
	instanceAddProjectFromVersion: (instanceId: string, versionId: string, reason: string, dependentOnVersionId?: string) => Promise<string>
	instanceRemoveProject: (instanceId: string, projectPath: string) => Promise<void>
	instanceInstallProjectWithDependencies: (instanceId: string, request: any) => Promise<any>

	// Events (from main process)
	onCommand: (callback: (payload: any) => void) => () => void
	onNotification: (callback: (payload: any) => void) => () => void
	onNativeError: (callback: (payload: NativeErrorPayload) => void) => () => void
}

interface Window {
	electronAPI: ElectronAPI
}
