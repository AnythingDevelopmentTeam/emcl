let tauriCore: typeof import('@tauri-apps/api/core') | null = null
let tauriApp: typeof import('@tauri-apps/api/app') | null = null
let tauriWindow: typeof import('@tauri-apps/api/window') | null = null
let tauriEvent: typeof import('@tauri-apps/api/event') | null = null
let tauriDialog: typeof import('@tauri-apps/plugin-dialog') | null = null
let tauriOs: typeof import('@tauri-apps/plugin-os') | null = null
let tauriOpener: typeof import('@tauri-apps/plugin-opener') | null = null
let tauriFs: typeof import('@tauri-apps/plugin-fs') | null = null

export const isTauri = typeof window !== 'undefined' && '__TAURI__' in window

async function ensureTauri() {
	if (!isTauri) return false
	if (tauriCore) return true
	try {
		tauriCore = await import('@tauri-apps/api/core')
		tauriApp = await import('@tauri-apps/api/app')
		tauriWindow = await import('@tauri-apps/api/window')
		tauriEvent = await import('@tauri-apps/api/event')
		tauriDialog = await import('@tauri-apps/plugin-dialog')
		tauriOs = await import('@tauri-apps/plugin-os')
		tauriOpener = await import('@tauri-apps/plugin-opener')
		tauriFs = await import('@tauri-apps/plugin-fs')
		return true
	} catch {
		return false
	}
}

const isElectron = typeof window !== 'undefined' && 'electronAPI' in window

export async function getVersion() {
	if (isElectron && window.electronAPI) {
		return await window.electronAPI.getAppVersion()
	}
	if (await ensureTauri() && tauriApp) {
		return await tauriApp.getVersion()
	}
	return '0.0.0'
}

export function getCurrentWindow() {
	const setDecorations = async (decorated: boolean) => {
		if (isElectron && window.electronAPI) {
			window.electronAPI.windowSetDecorations(decorated)
			return
		}
		if (await ensureTauri() && tauriCore) {
			await tauriCore.invoke('toggle_decorations', { b: decorated })
		}
	}

	if (isElectron && window.electronAPI) {
		return {
			setDecorations,
			isMaximized: async () => window.electronAPI!.windowIsMaximized(),
			minimize: async () => { window.electronAPI!.windowMinimize() },
			unmaximize: async () => {
				if (await window.electronAPI!.windowIsMaximized()) {
					window.electronAPI!.windowMaximize()
				}
			},
			maximize: async () => { window.electronAPI!.windowMaximize() },
			toggleMaximize: async () => { window.electronAPI!.windowMaximize() },
			close: async () => { window.electronAPI!.windowClose() },
			onResized: (callback: () => void) => {
				if (window.electronAPI) {
					return window.electronAPI.onWindowResized(callback)
				}
				return () => {}
			},
		}
	}

	const tauriWin = async () => {
		if (!(await ensureTauri()) || !tauriWindow) return null
		return tauriWindow.getCurrentWindow()
	}

	return {
		setDecorations,
		isMaximized: async () => (await tauriWin())?.isMaximized() ?? false,
		minimize: async () => (await tauriWin())?.minimize(),
		unmaximize: async () => (await tauriWin())?.unmaximize(),
		maximize: async () => (await tauriWin())?.maximize(),
		toggleMaximize: async () => (await tauriWin())?.toggleMaximize(),
		close: async () => (await tauriWin())?.close(),
		onResized: (callback: () => void) => {
			const winPromise = tauriWin()
			let cleanup = () => {}
			winPromise.then(win => {
				if (win) {
					const p = win.listen('resized', callback)
					p.then(unlisten => { cleanup = unlisten })
				}
			})
			return () => cleanup()
		},
	}
}

export async function getOsType(): Promise<string> {
	if (isElectron && window.electronAPI) {
		return (await window.electronAPI.utilsGetOs()).toLowerCase()
	}
	if (await ensureTauri() && tauriOs) {
		const p = await tauriOs.platform()
		return p.toLowerCase()
	}
	return 'linux'
}

export async function openUrl(url: string): Promise<void> {
	if (isElectron && window.electronAPI) {
		await window.electronAPI.openerOpenUrl(url)
		return
	}
	if (await ensureTauri() && tauriOpener) {
		await tauriOpener.openUrl(url)
		return
	}
	window.open(url, '_blank')
}

export async function saveWindowState(_flags: any): Promise<void> {
}

export const StateFlags = {
	NONE: 0,
	SIZE: 1,
	POSITION: 2,
	MAXIMIZED: 4,
	VISIBLE: 8,
	DECORATIONS: 16,
	FULLSCREEN: 32,
	ALL: 63,
}

export async function invoke(cmd: string, args?: any): Promise<any> {
	if (await ensureTauri() && tauriCore) {
		return await tauriCore.invoke(cmd, args)
	}
	console.warn('invoke called outside Tauri:', cmd, args)
}

export async function tauriFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
	return fetch(input, init)
}

export function convertFileSrc(filePath: string): string {
	if (isElectron) {
		return filePath
	}
	try {
		if (tauriCore) {
			return tauriCore.convertFileSrc(filePath)
		}
	} catch {}
	return filePath
}

export async function open(options?: any): Promise<any> {
	if (isElectron && window.electronAPI) {
		return await window.electronAPI.dialogOpen(options)
	}
	if (await ensureTauri() && tauriDialog) {
		return await tauriDialog.open(options)
	}
}

export async function save(options?: any): Promise<any> {
	if (isElectron && window.electronAPI) {
		return await window.electronAPI.dialogSave(options)
	}
	if (await ensureTauri() && tauriDialog) {
		return await tauriDialog.save(options)
	}
}

export async function readFile(filePath: string): Promise<string> {
	if (isElectron && window.electronAPI) {
		return await window.electronAPI.fileRead(filePath)
	}
	if (await ensureTauri() && tauriFs) {
		const bytes = await tauriFs.readFile(filePath)
		return new TextDecoder().decode(bytes)
	}
	throw new Error('readFile not available')
}

export async function platform(): Promise<string> {
	if (isElectron && window.electronAPI) {
		return (await window.electronAPI.utilsGetOs()).toLowerCase()
	}
	if (await ensureTauri() && tauriOs) {
		const p = await tauriOs.platform()
		return p.toLowerCase()
	}
	return 'linux'
}

export function getCurrentWebview(): any {
	const onDragDropEvent = (callback: (event: any) => void) => {
		if (isElectron) {
			document.addEventListener('drop', (e) => {
				e.preventDefault()
				const files = Array.from(e.dataTransfer?.files ?? [])
				callback({ paths: files.map(f => (f as any).path) })
			})
			return () => {}
		}
		const setupListener = async () => {
			if (!(await ensureTauri()) || !tauriWindow) return () => {}
			const wv = tauriWindow.getCurrentWebviewWindow ? tauriWindow.getCurrentWebviewWindow() : null
			if (!wv) return () => {}
			const unlisten = await wv.listen('tauri://drag-drop', (event) => {
				callback(event.payload)
			})
			return unlisten
		}
		let cleanup = () => {}
		setupListener().then(c => { cleanup = c })
		return () => cleanup()
	}

	return { onDragDropEvent }
}

export type DragDropEvent = any

export async function mkdir(path: string, options?: any): Promise<void> {
	if (!(await ensureTauri()) || !tauriFs) return
	await tauriFs.mkdir(path, options)
}

export async function readDir(path: string): Promise<any[]> {
	if (!(await ensureTauri()) || !tauriFs) return []
	return await tauriFs.readDir(path)
}

export async function readTextFile(path: string): Promise<string> {
	if (!(await ensureTauri()) || !tauriFs) return ''
	return await tauriFs.readTextFile(path)
}

export async function remove(path: string, options?: any): Promise<void> {
	if (!(await ensureTauri()) || !tauriFs) return
	await tauriFs.remove(path, options)
}

export async function rename(oldPath: string, newPath: string): Promise<void> {
	if (!(await ensureTauri()) || !tauriFs) return
	await tauriFs.rename(oldPath, newPath)
}

export async function stat(path: string): Promise<any> {
	if (!(await ensureTauri()) || !tauriFs) return null
	return await tauriFs.stat(path)
}

export async function writeFile(path: string, data: any, options?: any): Promise<void> {
	if (!(await ensureTauri()) || !tauriFs) return
	const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data
	await tauriFs.writeFile(path, bytes, options)
}

export async function writeTextFile(path: string, data: string): Promise<void> {
	if (!(await ensureTauri()) || !tauriFs) return
	await tauriFs.writeTextFile(path, data)
}
