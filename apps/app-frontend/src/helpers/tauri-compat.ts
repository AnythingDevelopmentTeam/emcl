import { invoke as tauriInvoke, convertFileSrc as tauriConvertFileSrc } from '@tauri-apps/api/core'
import { getVersion as tauriGetVersion } from '@tauri-apps/api/app'
import { getCurrentWindow as tauriGetCurrentWindow } from '@tauri-apps/api/window'
import { getCurrentWebview as tauriGetCurrentWebview } from '@tauri-apps/api/webview'
import { listen } from '@tauri-apps/api/event'
import { open as dialogOpen, save as dialogSave } from '@tauri-apps/plugin-dialog'
import { platform as osPlatform } from '@tauri-apps/plugin-os'
import { openUrl as openerOpenUrl } from '@tauri-apps/plugin-opener'
import {
	mkdir as fsMkdir,
	readDir as fsReadDir,
	readFile as fsReadFile,
	readTextFile as fsReadTextFile,
	remove as fsRemove,
	rename as fsRename,
	stat as fsStat,
	writeFile as fsWriteFile,
	writeTextFile as fsWriteTextFile,
} from '@tauri-apps/plugin-fs'

export async function getVersion() {
	return await tauriGetVersion()
}

export function getCurrentWindow() {
	const win = tauriGetCurrentWindow()
	return {
		setDecorations: async (decorated: boolean) => {
			await tauriInvoke('toggle_decorations', { b: decorated })
		},
		isMaximized: async () => await win.isMaximized(),
		minimize: async () => await win.minimize(),
		unmaximize: async () => await win.unmaximize(),
		maximize: async () => await win.maximize(),
		close: async () => await win.close(),
		onResized: (callback: () => void) => {
			return win.listen('resized', callback)
		},
	}
}

export async function getOsType(): Promise<string> {
	const p = await osPlatform()
	return p.toLowerCase()
}

export async function openUrl(url: string): Promise<void> {
	await openerOpenUrl(url)
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
	return await tauriInvoke(cmd, args)
}

export async function tauriFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
	return fetch(input, init)
}

export function convertFileSrc(filePath: string): string {
	return tauriConvertFileSrc(filePath)
}

export async function open(options?: any): Promise<any> {
	return await dialogOpen(options)
}

export async function save(options?: any): Promise<any> {
	return await dialogSave(options)
}

export async function readFile(filePath: string): Promise<string> {
	const bytes = await fsReadFile(filePath)
	return new TextDecoder().decode(bytes)
}

export async function platform(): Promise<string> {
	const p = await osPlatform()
	return p.toLowerCase()
}

export function getCurrentWebview(): any {
	const wv = tauriGetCurrentWebview()
	return {
		onDragDropEvent: (callback: (event: any) => void) => {
			return wv.listen('tauri://drag-drop', (event) => {
				callback(event.payload)
			})
		},
	}
}

export type DragDropEvent = any

export async function mkdir(path: string, options?: any): Promise<void> {
	await fsMkdir(path, options)
}

export async function readDir(path: string): Promise<any[]> {
	return await fsReadDir(path)
}

export async function readTextFile(path: string): Promise<string> {
	return await fsReadTextFile(path)
}

export async function remove(path: string, options?: any): Promise<void> {
	await fsRemove(path, options)
}

export async function rename(oldPath: string, newPath: string): Promise<void> {
	await fsRename(oldPath, newPath)
}

export async function stat(path: string): Promise<any> {
	return await fsStat(path)
}

export async function writeFile(path: string, data: any, options?: any): Promise<void> {
	const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data
	await fsWriteFile(path, bytes, options)
}

export async function writeTextFile(path: string, data: string): Promise<void> {
	await fsWriteTextFile(path, data)
}
