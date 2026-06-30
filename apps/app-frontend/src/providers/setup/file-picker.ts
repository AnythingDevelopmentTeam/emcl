import { provideFilePicker } from '@emcl/ui'

import { convertFileSrc, open, readFile } from '@/helpers/tauri-compat'

function getFileName(path: string, fallback: string) {
	return path.split(/[\\/]/).pop() || fallback
}

function getDialogPath(result: string | { path?: string } | null | undefined) {
	if (!result) return null
	return typeof result === 'string' ? result : (result.path ?? null)
}

async function createFileFromPath(path: string, fallbackName: string, type?: string) {
	const bytes = await readFile(path)
	const name = getFileName(path, fallbackName)
	return new File([bytes], name, type ? { type } : undefined)
}

async function createNativeFileFromPath(path: string, fallbackName: string, type?: string) {
	const isElectron = typeof window !== 'undefined' && 'electronAPI' in window
	let bytes: Uint8Array
	if (isElectron && window.electronAPI) {
		const result = await window.electronAPI.fileRead(path)
		bytes = typeof result === 'string' ? new TextEncoder().encode(result) : new Uint8Array(result as any)
	} else {
		bytes = new Uint8Array()
	}
	const name = getFileName(path, fallbackName)
	return new File([bytes], name, type ? { type } : undefined)
}

export function setupFilePickerProvider() {
	provideFilePicker({
		async pickFiles(options) {
			const result = await open({
				multiple: options?.multiple ?? true,
			})
			if (!result) return []

			const paths = Array.isArray(result) ? result : [result]
			return await Promise.all(
				paths
					.map(getDialogPath)
					.filter((path): path is string => !!path)
					.map(async (path) => ({
						file: await createNativeFileFromPath(path, 'file'),
						path,
						previewUrl: convertFileSrc(path),
					})),
			)
		},
		async pickImage() {
			const result = await open({
				multiple: false,
				filters: [{ name: 'Image', extensions: ['png', 'jpeg', 'jpg', 'svg', 'webp', 'gif'] }],
			})
			if (!result) return null
			const path = getDialogPath(result)
			if (!path) return null
			const file = await createFileFromPath(path, 'icon')
			return { file, path, previewUrl: convertFileSrc(path) }
		},
		async pickModpackFile(options) {
			const result = await open({
				multiple: false,
				filters: [{ name: 'Modpack', extensions: ['mrpack'] }],
			})
			if (!result) return null
			const path = getDialogPath(result)
			if (!path) return null
			if (options?.readFile === false) {
				// Instance imports stream from the native path, keeping large packs out of JS memory.
				return { path, previewUrl: '' }
			}
			return {
				file: await createFileFromPath(
					path,
					'modpack.mrpack',
					'application/x-modrinth-modpack+zip',
				),
				path,
				previewUrl: '',
			}
		},
	})
}
