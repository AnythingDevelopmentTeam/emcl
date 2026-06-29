export async function getVersion() {
	return await window.electronAPI!.getAppVersion()
}

export function getCurrentWindow() {
	return {
		setDecorations: async (decorated: boolean) => window.electronAPI!.windowSetDecorations(decorated),
		isMaximized: async () => window.electronAPI!.windowIsMaximized(),
		minimize: async () => window.electronAPI!.windowMinimize(),
		unmaximize: async () => { /* no-op */ },
		maximize: async () => window.electronAPI!.windowMaximize(),
		close: async () => window.electronAPI!.windowClose(),
		onResized: (callback: () => void) => {
			const cleanup = window.electronAPI!.onWindowResized(callback)
			return cleanup
		},
	}
}

export async function getOsType(): Promise<string> {
	const os = await window.electronAPI.utilsGetOs()
	return os.toLowerCase()
}

export async function openUrl(url: string): Promise<void> {
	return window.electronAPI.openerOpenUrl(url)
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
	console.warn('[tauri-compat] invoke() called:', cmd, args)
	if (cmd === 'show_window') return
	if (cmd === 'plugin:updater|check') {
		throw new Error('App updates not implemented in Electron build')
	}
	throw new Error(`Tauri invoke not supported: ${cmd}`)
}

export async function tauriFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
	return fetch(input, init)
}

export function convertFileSrc(filePath: string): string {
	return `file://${filePath}`
}

export async function open(options?: any): Promise<any> {
	return await window.electronAPI.dialogOpen(options ?? {})
}

export async function save(options?: any): Promise<any> {
	return await window.electronAPI.dialogSave(options ?? {})
}

export async function readFile(filePath: string): Promise<string> {
	return await window.electronAPI.fileRead(filePath)
}

export async function platform(): Promise<string> {
	const os = await window.electronAPI.utilsGetOs()
	return os.toLowerCase()
}

export function getCurrentWebview(): any {
	return {
		onDragDropEvent: (callback: (event: any) => void) => {
			console.warn('[tauri-compat] onDragDropEvent not implemented')
			return () => {}
		},
	}
}

export type DragDropEvent = any

// Filesystem stubs — not implemented in Electron
export async function mkdir(_path: string, _options?: any): Promise<void> {
	console.warn('[tauri-compat] mkdir not implemented')
}
export async function readDir(_path: string): Promise<any[]> {
	console.warn('[tauri-compat] readDir not implemented')
	return []
}
export async function readTextFile(_path: string): Promise<string> {
	console.warn('[tauri-compat] readTextFile not implemented')
	return ''
}
export async function remove(_path: string, _options?: any): Promise<void> {
	console.warn('[tauri-compat] remove not implemented')
}
export async function rename(_old: string, _new: string): Promise<void> {
	console.warn('[tauri-compat] rename not implemented')
}
export async function stat(_path: string): Promise<any> {
	console.warn('[tauri-compat] stat not implemented')
	return null
}
export async function writeFile(_path: string, _data: any, _options?: any): Promise<void> {
	console.warn('[tauri-compat] writeFile not implemented')
}
export async function writeTextFile(_path: string, _data: string): Promise<void> {
	console.warn('[tauri-compat] writeTextFile not implemented')
}
