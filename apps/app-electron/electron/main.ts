import { app, BrowserWindow, ipcMain, protocol, shell, session } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

const isDev = !app.isPackaged;
let native: any = null;
let mainWindow: BrowserWindow | null = null;

function loadNativeAddon() {
	const ext = process.platform === 'win32' ? 'dll' : 'node';
	const addonPath = isDev
		? path.join(__dirname, '../native/napi_theseus.node')
		: path.join(process.resourcesPath, 'native', `napi_theseus.${ext}`);

	if (!fs.existsSync(addonPath)) {
		console.error(`Native addon not found at: ${addonPath}`);
		if (isDev) console.error('Run `pnpm dev:native` first to compile the Rust backend');
		return;
	}

	try {
		native = require(addonPath);
	} catch (e) {
		console.error(`Failed to load native addon:`, e);
	}
}

// Enable Wayland support for the UI
if (process.platform === 'linux') {
	app.commandLine.appendSwitch('enable-features', 'UseOzonePlatform');
	app.commandLine.appendSwitch('ozone-platform-hint', 'auto');
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
	app.quit();
} else {
	app.on('second-instance', (_event, commandLine) => {
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore();
			mainWindow.focus();
			const payload = commandLine.find((arg) => arg.startsWith('modrinth://'));
			if (payload) {
				mainWindow.webContents.send('command', payload);
			}
		}
	});
}

function createWindow() {
	const { screen } = require('electron');
	const primaryDisplay = screen.getPrimaryDisplay();
	const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
	const width = Math.min(1280, screenWidth);
	const height = Math.min(800, screenHeight);

	mainWindow = new BrowserWindow({
		width,
		height,
		minWidth: 1100,
		minHeight: 700,
		title: 'EMCL',
		frame: true,
		icon: '/home/vesno/Изображения/blender/Untitled.png',
		show: false,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: false,
		},
	});

	const frontendDist = path.join(__dirname, '../../app-frontend/dist');
	const frontendIndex = path.join(frontendDist, 'index.html');

	if (fs.existsSync(frontendIndex)) {
		mainWindow.loadFile(frontendIndex);
	} else {
		mainWindow.loadURL('http://localhost:1420');
	}
	if (isDev) {
		mainWindow.webContents.openDevTools();
	}

	// Capture renderer console messages for debugging
	mainWindow.webContents.on('console-message', (_e, level, message, line, sourceId) => {
		const levelStr = ['verbose', 'info', 'warning', 'error'][level] ?? 'unknown';
		console.log(`[renderer:${levelStr}] ${message} (${sourceId}:${line})`);
	});

	mainWindow.on('resize', () => {
		mainWindow?.webContents.send('window-resized');
	});

	mainWindow.once('ready-to-show', () => {
		mainWindow?.show();
	});

	mainWindow.on('closed', () => {
		mainWindow = null;
	});

	if (process.platform !== 'linux') {
		try {
			mainWindow.setBackgroundColor('#00000000');
		} catch (e) {
			console.warn('Failed to set window shadow:', e);
		}
	}
}

async function safeNativeCall<T>(method: string, defaultValue: T, ...args: any[]): Promise<T> {
	try {
		if (!native) throw new Error(`Native backend not available: ${method}`);
		const fn = native[method];
		if (typeof fn !== 'function') throw new Error(`Native method not found: ${method}`);
		return await fn(...args);
	} catch (e: any) {
		const msg = e?.message ?? String(e);
		const stack = e?.stack;
		console.error(`[native] ${method} failed:`, msg);
		if (stack) console.error(`[native] Stack:`, stack);

		// Send toast notification
		mainWindow?.webContents.send('notification', {
			type: 'error',
			title: `Backend error: ${method}`,
			text: msg,
		});

		// Send severe error for error modal (with full details)
		mainWindow?.webContents.send('native-error', {
			method,
			message: msg,
			stack: stack ?? new Error().stack ?? '',
			args: args.map(a => typeof a === 'string' ? a.slice(0, 200) : String(a).slice(0, 200)),
			timestamp: Date.now(),
		});

		return defaultValue;
	}
}

function registerIpcHandlers() {
	// ==================== AUTH (Minecraft) ====================
	ipcMain.handle('auth:check_reachable', async () => safeNativeCall("authCheckReachable", undefined,  ));
	ipcMain.handle('auth:begin_login', async () => safeNativeCall("authBeginLogin", null,  ));
	ipcMain.handle('auth:finish_login', async (_e, code: string, flowJson: string) => safeNativeCall("authFinishLogin", undefined, code, flowJson));

	// Complete Microsoft OAuth login flow: open auth window, wait for redirect, finish login
	ipcMain.handle('auth:login', async () => {
		// Try SISU auth flow first (requires cookie_store on reqwest)
		const flow = await safeNativeCall<any>("authBeginLogin", null);
		const flowJson = flow ? JSON.stringify(flow) : null;

		const authUrl = flow?.auth_request_uri;

		if (!authUrl) {
			// Fallback: manual PKCE OAuth (no SISU)
			const verifierBytes = crypto.randomBytes(64);
			const verifier = verifierBytes.toString('hex');
			const challengeHash = crypto.createHash('sha256').update(verifier).digest();
			const challenge = challengeHash
				.toString('base64')
				.replace(/\+/g, '-')
				.replace(/\//g, '_')
				.replace(/=+$/, '');

			const fallbackFlow = {
				verifier,
				challenge,
				session_id: '',
				auth_request_uri:
					`https://login.live.com/oauth20_authorize.srf?` +
					`client_id=${encodeURIComponent('00000000402b5328')}` +
					`&response_type=code` +
					`&redirect_uri=${encodeURIComponent('https://login.live.com/oauth20_desktop.srf')}` +
					`&scope=${encodeURIComponent('service::user.auth.xboxlive.com::MBI_SSL')}` +
					`&code_challenge=${encodeURIComponent(challenge)}` +
					`&code_challenge_method=S256` +
					`&state=${encodeURIComponent(verifierBytes.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').slice(0, 32))}` +
					`&prompt=select_account`,
			};
			return doAuthWindow(fallbackFlow.auth_request_uri, JSON.stringify(fallbackFlow));
		}

		return doAuthWindow(authUrl, flowJson!);
	});

	async function doAuthWindow(authUrl: string, flowJson: string) {
		const authWindow = new BrowserWindow({
			width: 800,
			height: 700,
			title: 'Sign in to Microsoft',
			alwaysOnTop: true,
			webPreferences: {
				contextIsolation: true,
				nodeIntegration: false,
				sandbox: true,
			},
		});

		authWindow.loadURL(authUrl);

		return new Promise((resolve, reject) => {
			const checkUrl = () => {
				const url = authWindow.webContents.getURL();
				if (url.startsWith('https://login.live.com/oauth20_desktop.srf')) {
					const parsed = new URL(url);
					const code = parsed.searchParams.get('code');
					if (code) {
						authWindow.close();
						safeNativeCall("authFinishLogin", undefined, code, flowJson)
							.then(resolve)
							.catch(reject);
					}
				}
			};

			const interval = setInterval(checkUrl, 100);

			authWindow.webContents.on('will-redirect', (_e, url) => {
				if (url.startsWith('https://login.live.com/oauth20_desktop.srf')) {
					const parsed = new URL(url);
					const code = parsed.searchParams.get('code');
					if (code) {
						clearInterval(interval);
						authWindow.close();
						safeNativeCall("authFinishLogin", undefined, code, flowJson)
							.then(resolve)
							.catch(reject);
					}
				}
			});

			authWindow.on('closed', () => {
				clearInterval(interval);
				resolve(null);
			});
		});
	}

	ipcMain.handle('auth:get_default_user', async () => safeNativeCall("authGetDefaultUser", null,  ));
	ipcMain.handle('auth:set_default_user', async (_e, user: string) => safeNativeCall("authSetDefaultUser", undefined, user));
	ipcMain.handle('auth:remove_user', async (_e, user: string) => safeNativeCall("authRemoveUser", undefined, user));
	ipcMain.handle('auth:get_users', async () => safeNativeCall("authGetUsers", [],  ));
	ipcMain.handle('auth:create_offline', async (_e, username: string) => safeNativeCall("authCreateOffline", null, username));

	// ==================== MODRINTH AUTH ====================
	ipcMain.handle('mr-auth:get', async () => safeNativeCall("mrAuthGet", null,  ));
	ipcMain.handle('mr-auth:logout', async () => safeNativeCall("mrAuthLogout", undefined,  ));

	// ==================== INSTANCES ====================
	ipcMain.handle('instance:list', async () => safeNativeCall("instanceList", [],  ));
	ipcMain.handle('instance:get', async (_e, id: string) => safeNativeCall("instanceGet", null, id));
	ipcMain.handle('instance:get_many', async (_e, ids: string[]) => safeNativeCall("instanceGetMany", [], ids));
	ipcMain.handle('instance:remove', async (_e, id: string) => safeNativeCall("instanceRemove", undefined, id));
	ipcMain.handle('instance:get_projects', async (_e, id: string) => safeNativeCall("instanceGetProjects", [], id));
	ipcMain.handle('instance:run', async (_e, id: string) => safeNativeCall("instanceRun", undefined, id));
	ipcMain.handle('instance:kill', async (_e, id: string) => safeNativeCall("instanceKill", undefined, id));
	ipcMain.handle('instance:edit', async (_e, id: string, metadata: string) => safeNativeCall("instanceEdit", undefined, id, metadata));
	ipcMain.handle('instance:edit_icon', async (_e, id: string, iconPath?: string) => safeNativeCall("instanceEditIcon", undefined, id, iconPath ?? null));
	ipcMain.handle('instance:check_installed', async (_e, id: string, projectId: string) => safeNativeCall("instanceCheckInstalled", false, id, projectId));
	ipcMain.handle('instance:get_optimal_jre_key', async (_e, id: string) => safeNativeCall("instanceGetOptimalJreKey", null, id));
	ipcMain.handle('instance:toggle_disable_project', async (_e, id: string, projectId: string, desiredEnabled?: boolean) => safeNativeCall("instanceToggleDisableProject", undefined, id, projectId, desiredEnabled ?? null));
	ipcMain.handle('instance:export_mrpack', async (_e, id: string, path: string, candidates: string[], versionId?: string, description?: string, name?: string) => safeNativeCall("instanceExportMrpack", null, id, path, candidates, versionId ?? null, description ?? null, name ?? null));

	// ==================== INSTANCE MOD OPS (Node.js fallback) ====================
	ipcMain.handle('instance:add_project_from_version', async (_e, instanceId: string, versionId: string, reason: string, dependentOnVersionId?: string) => {
		try {
			const instance: any = await safeNativeCall("instanceGet", null, instanceId);
			if (!instance || !instance.path) throw new Error('Instance not found');
			const versionRes = await fetch(`https://api.modrinth.com/v2/version/${versionId}`);
			if (!versionRes.ok) throw new Error('Failed to fetch version');
			const version = await versionRes.json();
			const primaryFile = version.files?.find((f: any) => !f.optional) ?? version.files?.[0];
			if (!primaryFile) throw new Error('No downloadable file found');
			const modsDir = path.join(instance.path, 'mods');
			fs.mkdirSync(modsDir, { recursive: true });
			const fileRes = await fetch(primaryFile.url);
			if (!fileRes.ok) throw new Error('Failed to download file');
			fs.writeFileSync(path.join(modsDir, primaryFile.filename), Buffer.from(await fileRes.arrayBuffer()));
			return primaryFile.filename;
		} catch (e) {
			console.warn('[native] add_project_from_version failed:', e);
			return '';
		}
	});
	ipcMain.handle('instance:remove_project', async (_e, instanceId: string, projectPath: string) => {
		try {
			const instance: any = await safeNativeCall("instanceGet", null, instanceId);
			if (!instance || !instance.path) throw new Error('Instance not found');
			const fullPath = path.join(instance.path, projectPath);
			if (fs.existsSync(fullPath)) fs.rmSync(fullPath, { recursive: true });
		} catch (e) {
			console.warn('[native] remove_project failed:', e);
		}
	});
	ipcMain.handle('instance:install_project_with_dependencies', async (_e, instanceId: string, requestJson: string) => {
		try {
			const request = JSON.parse(requestJson);
			const { project_id, version_id, content_type } = request;
			const instance: any = await safeNativeCall("instanceGet", null, instanceId);
			if (!instance || !instance.path) throw new Error('Instance not found');
			const versionRes = await fetch(`https://api.modrinth.com/v2/version/${version_id}`);
			if (!versionRes.ok) throw new Error('Failed to fetch version');
			const version = await versionRes.json();
			const primaryFile = version.files?.find((f: any) => !f.optional) ?? version.files?.[0];
			if (!primaryFile) throw new Error('No downloadable file found');
			const subDir = content_type === 'shader' ? 'shaderpacks'
				: content_type === 'resourcepack' ? 'resourcepacks'
				: content_type === 'datapack' ? 'datapacks'
				: 'mods';
			const targetDir = path.join(instance.path, subDir);
			fs.mkdirSync(targetDir, { recursive: true });
			const fileRes = await fetch(primaryFile.url);
			if (!fileRes.ok) throw new Error('Failed to download file');
			fs.writeFileSync(path.join(targetDir, primaryFile.filename), Buffer.from(await fileRes.arrayBuffer()));
			return { primary: { project_id, version_id, dependent_on_version_id: null }, dependencies: [], skipped: [] };
		} catch (e) {
			console.warn('[native] install_project_with_dependencies failed:', e);
			return { primary: { project_id: null, version_id: null, dependent_on_version_id: null }, dependencies: [], skipped: [] };
		}
	});

	// ==================== INSTALL ====================
	ipcMain.handle('install:create_instance', async (_e, name: string, gameVersion: string, loader: string, loaderVersion?: string, iconPath?: string, linkJson?: string) => safeNativeCall("installCreateInstance", null, name, gameVersion, loader, loaderVersion ?? null, iconPath ?? null, linkJson ?? null));
	ipcMain.handle('install:job_list', async (_e, includeFinished: boolean) => safeNativeCall("installJobList", [], includeFinished));
	ipcMain.handle('install:job_get', async (_e, jobId: string) => safeNativeCall("installJobGet", null, jobId));
	ipcMain.handle('install:job_retry', async (_e, jobId: string) => safeNativeCall("installJobRetry", undefined, jobId));
	ipcMain.handle('install:job_cancel', async (_e, jobId: string) => safeNativeCall("installJobCancel", undefined, jobId));
	ipcMain.handle('install:job_dismiss', async (_e, jobId: string) => safeNativeCall("installJobDismiss", undefined, jobId));

	// ==================== SETTINGS ====================
	ipcMain.handle('settings:get', async () => {
		const raw = await safeNativeCall<any>("settingsGet", null);
		if (!raw) return null;
		// Transform Rust format → frontend format
		const memory = raw.memory;
		const res = raw.game_resolution;
		return {
			...raw,
			memory: {
				memory_override: false,
				memory_ceiling: memory?.maximum ?? 4096,
				memory_floor: 1024,
			},
			game_resolution: {
				width: Array.isArray(res) ? res[0] : 854,
				height: Array.isArray(res) ? res[1] : 480,
			},
		};
	});
	ipcMain.handle('settings:set', async (_e, settingsJson: string) => {
		try {
			const s = JSON.parse(settingsJson);
			// Transform frontend format → Rust format
			if (s.memory && typeof s.memory === 'object') {
				s.memory = { maximum: s.memory.memory_ceiling ?? 4096 };
			}
			if (s.game_resolution && typeof s.game_resolution === 'object') {
				s.game_resolution = [s.game_resolution.width ?? 854, s.game_resolution.height ?? 480];
			}
			return await safeNativeCall("settingsSet", undefined, JSON.stringify(s));
		} catch (e) {
			console.warn('[native] settings:set transform failed:', e);
			return undefined;
		}
	});
	ipcMain.handle('settings:cancel_directory_change', async (_e, appId: string) => safeNativeCall("settingsCancelDirectoryChange", undefined, appId));

	// ==================== JRE ====================
	ipcMain.handle('jre:get_java_versions', async () => safeNativeCall("jreGetJavaVersions", [],  ));
	ipcMain.handle('jre:set_java_version', async (_e, versionJson: string) => safeNativeCall("jreSetJavaVersion", undefined, versionJson));
	ipcMain.handle('jre:auto_install_java', async (_e, version: number) => safeNativeCall("jreAutoInstallJava", undefined, version));
	ipcMain.handle('jre:get_max_memory', async () => safeNativeCall("jreGetMaxMemory", null,  ));

	// ==================== PROCESS ====================
	ipcMain.handle('process:get_by_instance_id', async (_e, instanceId: string) => safeNativeCall("processGetByInstanceId", null, instanceId));
	ipcMain.handle('process:get_all', async () => safeNativeCall("processGetAll", [],  ));
	ipcMain.handle('process:kill', async (_e, processUuid: string) => safeNativeCall("processKill", undefined, processUuid));

	// ==================== UTILS ====================
	ipcMain.handle('utils:get_os', () => safeNativeCall("utilsGetOs", "linux",  ));
	ipcMain.handle('utils:is_dev', () => safeNativeCall("utilsIsDev", true,  ));
	ipcMain.handle('utils:are_updates_enabled', () => safeNativeCall("utilsAreUpdatesEnabled", false,  ));
	ipcMain.handle('utils:is_network_metered', async () => safeNativeCall("utilsIsNetworkMetered", false,  ));
	ipcMain.handle('utils:progress_bars_list', async () => safeNativeCall("utilsProgressBarsList", [],  ));

	// ==================== CACHE ====================
	ipcMain.handle('cache:get_project', async (_e, id: string, cacheBehaviour?: string) => safeNativeCall("cacheGetProject", null, id, cacheBehaviour ?? null));
	ipcMain.handle('cache:get_project_many', async (_e, ids: string[], cacheBehaviour?: string) => safeNativeCall("cacheGetProjectMany", [], ids, cacheBehaviour ?? null));
	ipcMain.handle('cache:get_version', async (_e, id: string, cacheBehaviour?: string) => safeNativeCall("cacheGetVersion", null, id, cacheBehaviour ?? null));
	ipcMain.handle('cache:get_version_many', async (_e, ids: string[], cacheBehaviour?: string) => safeNativeCall("cacheGetVersionMany", [], ids, cacheBehaviour ?? null));
	ipcMain.handle('cache:get_user', async (_e, id: string, cacheBehaviour?: string) => safeNativeCall("cacheGetUser", null, id, cacheBehaviour ?? null));
	ipcMain.handle('cache:get_user_many', async (_e, ids: string[], cacheBehaviour?: string) => safeNativeCall("cacheGetUserMany", [], ids, cacheBehaviour ?? null));
	ipcMain.handle('cache:get_team', async (_e, id: string, cacheBehaviour?: string) => safeNativeCall("cacheGetTeam", null, id, cacheBehaviour ?? null));
	ipcMain.handle('cache:get_team_many', async (_e, ids: string[], cacheBehaviour?: string) => safeNativeCall("cacheGetTeamMany", [], ids, cacheBehaviour ?? null));
	ipcMain.handle('cache:get_search_results', async (_e, url: string, cacheBehaviour?: string) => safeNativeCall("cacheGetSearchResults", null, url, cacheBehaviour ?? null));
	ipcMain.handle('cache:purge_types', async (_e, types: string[]) => safeNativeCall("cachePurgeTypes", undefined, types));

	// ==================== FRIENDS ====================
	ipcMain.handle('friends:list', async () => safeNativeCall("friendsList", [],  ));
	ipcMain.handle('friends:statuses', async () => safeNativeCall("friendsStatuses", [],  ));
	ipcMain.handle('friends:add', async (_e, userId: string) => safeNativeCall("friendsAdd", undefined, userId));
	ipcMain.handle('friends:remove', async (_e, userId: string) => safeNativeCall("friendsRemove", undefined, userId));

	// ==================== LOGS ====================
	ipcMain.handle('logs:get_logs', async (_e, instanceId: string, clearContents?: boolean) => safeNativeCall("logsGetLogs", [], instanceId, clearContents ?? null));
	ipcMain.handle('logs:get_by_filename', async (_e, instanceId: string, logType: string, filename: string) => safeNativeCall("logsGetByFilename", [], instanceId, logType, filename));
	ipcMain.handle('logs:delete_logs', async (_e, instanceId: string) => safeNativeCall("logsDeleteLogs", undefined, instanceId));
	ipcMain.handle('logs:get_latest_log_cursor', async (_e, instanceId: string, cursor: number) => safeNativeCall("logsGetLatestLogCursor", null, instanceId, cursor));
	ipcMain.handle('logs:get_live_log_buffer', async (_e, instanceId: string) => safeNativeCall("logsGetLiveLogBuffer", [], instanceId));
	ipcMain.handle('logs:clear_live_log_buffer', async (_e, instanceId: string) => safeNativeCall("logsClearLiveLogBuffer", undefined, instanceId));

	// ==================== METADATA ====================
	ipcMain.handle('metadata:get_minecraft_versions', async () => safeNativeCall("metadataGetMinecraftVersions", null,  ));
	ipcMain.handle('metadata:get_loader_versions', async (_e, loader: string) => safeNativeCall("metadataGetLoaderVersions", null, loader));

	// ==================== TAGS ====================
	ipcMain.handle('tags:get_categories', async () => safeNativeCall("tagsGetCategories", [],  ));
	ipcMain.handle('tags:get_loaders', async () => safeNativeCall("tagsGetLoaders", [],  ));
	ipcMain.handle('tags:get_game_versions', async () => safeNativeCall("tagsGetGameVersions", [],  ));
	ipcMain.handle('tags:get_donation_platforms', async () => safeNativeCall("tagsGetDonationPlatforms", [],  ));
	ipcMain.handle('tags:get_report_types', async () => safeNativeCall("tagsGetReportTypes", [],  ));

	// ==================== WORLDS ====================
	ipcMain.handle('worlds:get_recent', async (_e, limit: number, displayStatuses: string[]) => safeNativeCall("worldsGetRecent", [], limit, displayStatuses));
	ipcMain.handle('worlds:get_instance_worlds', async (_e, instanceId: string) => safeNativeCall("worldsGetInstanceWorlds", [], instanceId));
	ipcMain.handle('worlds:delete', async (_e, instanceId: string, worldName: string) => safeNativeCall("worldsDelete", undefined, instanceId, worldName));
	ipcMain.handle('worlds:backup', async (_e, instanceId: string, worldName: string) => safeNativeCall("worldsBackup", undefined, instanceId, worldName));
	ipcMain.handle('worlds:rename', async (_e, instanceId: string, oldName: string, newName: string) => safeNativeCall("worldsRename", undefined, instanceId, oldName, newName));
	ipcMain.handle('worlds:set_display_status', async (_e, instanceId: string, worldType: string, worldId: string, status: string) => safeNativeCall("worldsSetDisplayStatus", undefined, instanceId, worldType, worldId, status));

	// ==================== SKINS ====================
	ipcMain.handle('skins:get_available_capes', async () => safeNativeCall("skinsGetAvailableCapes", [],  ));
	ipcMain.handle('skins:get_available_skins', async () => safeNativeCall("skinsGetAvailableSkins", [],  ));
	ipcMain.handle('skins:equip_skin', async (_e, skinJson: string) => safeNativeCall("skinsEquipSkin", undefined, skinJson));
	ipcMain.handle('skins:unequip_skin', async () => safeNativeCall("skinsUnequipSkin", undefined,  ));
	ipcMain.handle('skins:remove_custom_skin', async (_e, skinJson: string) => safeNativeCall("skinsRemoveCustomSkin", undefined, skinJson));
	ipcMain.handle('skins:save_custom_skin', async (_e, skinJson: string, textureBlob: Buffer, variant: string, capeJson?: string, replaceTexture?: boolean) => safeNativeCall("skinsSaveCustomSkin", undefined, skinJson, textureBlob, variant, capeJson ?? null, replaceTexture ?? false));
	ipcMain.handle('skins:flush_pending_skin_change', async () => safeNativeCall("skinsFlushPendingSkinChange", undefined,  ));
	ipcMain.handle('skins:normalize_texture', async (_e, texture: string | Buffer) => safeNativeCall("skinsNormalizeSkinTexture", null, texture));

	// ==================== FILES ====================
	ipcMain.handle('file:read', async (_e, filePath: string) => safeNativeCall("fileRead", "", filePath));

	// ==================== STATE ====================
	ipcMain.handle('state:init', async (_e, appIdentifier: string) => safeNativeCall("initState", undefined, appIdentifier));
	ipcMain.handle('state:is_initialized', () => safeNativeCall("isStateInitialized", false,  ));

	// ==================== DIALOG (Electron native) ====================
	ipcMain.handle('dialog:open', async (_e, options: any) => {
		const { dialog } = require('electron');
		if (!mainWindow) return null;
		return await dialog.showOpenDialog(mainWindow, options);
	});

	ipcMain.handle('dialog:save', async (_e, options: any) => {
		const { dialog } = require('electron');
		if (!mainWindow) return null;
		return await dialog.showSaveDialog(mainWindow, options);
	});

	// ==================== WINDOW OPS ====================
	ipcMain.handle('window:minimize', () => mainWindow?.minimize());
	ipcMain.handle('window:maximize', () => {
		if (mainWindow?.isMaximized()) mainWindow.unmaximize();
		else mainWindow?.maximize();
	});
	ipcMain.handle('window:close', () => mainWindow?.close());
	ipcMain.handle('window:is_maximized', () => mainWindow?.isMaximized() ?? false);
	ipcMain.handle('window:set_decorations', (_e, decorated: boolean) => mainWindow?.setMenuBarVisibility(decorated));

	// ==================== FILE DIALOG / OPENER ====================
	ipcMain.handle('opener:open_url', async (_e, url: string) => await shell.openExternal(url));
	ipcMain.handle('opener:open_path', async (_e, filePath: string) => await shell.openPath(filePath));
	ipcMain.handle('opener:show_item_in_folder', async (_e, filePath: string) => shell.showItemInFolder(filePath));

	// ==================== APP VERSION ====================
	ipcMain.handle('app:get_version', async () => app.getVersion());
}

app.whenReady().then(() => {
	loadNativeAddon();
	registerIpcHandlers();
	createWindow();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
	if (mainWindow === null) createWindow();
});
