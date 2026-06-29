import { get_full_path, get_mod_full_path } from '@/helpers/instance'

export async function isDev() {
	try {
		return await window.electronAPI.utilsIsDev()
	} catch {
		return false
	}
}

export async function areUpdatesEnabled() {
	try {
		return await window.electronAPI.utilsAreUpdatesEnabled()
	} catch {
		return false
	}
}

export async function getUpdateSize(updateRid) {
	throw new Error('getUpdateSize not implemented in Electron build')
}

export async function enqueueUpdateForInstallation(updateRid) {
	throw new Error('enqueueUpdateForInstallation not implemented in Electron build')
}

export async function removeEnqueuedUpdate() {
	throw new Error('removeEnqueuedUpdate not implemented in Electron build')
}

export async function setRestartAfterPendingUpdate(should_restart) {
	throw new Error('setRestartAfterPendingUpdate not implemented in Electron build')
}

export async function getOS() {
	try {
		return await window.electronAPI.utilsGetOs()
	} catch {
		return ''
	}
}

export async function isNetworkMetered() {
	try {
		return await window.electronAPI.utilsIsNetworkMetered()
	} catch {
		return false
	}
}

export async function openPath(path) {
	try {
		return await window.electronAPI.openerOpenPath(path)
	} catch {
		return null
	}
}

export async function highlightInFolder(path) {
	try {
		return await window.electronAPI.openerShowItemInFolder(path)
	} catch {
		return null
	}
}

export async function showLauncherLogsFolder() {
	throw new Error('showLauncherLogsFolder not implemented in Electron build')
}

export async function createInstanceShortcut(instanceName, instanceId, options = {}) {
	try {
		const outputPath = await window.electronAPI.dialogSave({
			defaultPath: `Modrinth - ${instanceName}`,
		})

		if (!outputPath) return null

		throw new Error('createInstanceShortcut not implemented in Electron build')
	} catch {
		return null
	}
}

export async function showAppDbBackupsFolder() {
	throw new Error('showAppDbBackupsFolder not implemented in Electron build')
}

export async function showInstanceInFolder(instanceId) {
	const fullPath = await get_full_path(instanceId)
	return await openPath(fullPath)
}

export async function highlightModInInstance(instanceId, projectPath) {
	const fullPath = await get_mod_full_path(instanceId, projectPath)
	return await highlightInFolder(fullPath)
}

export async function restartApp() {
	throw new Error('restartApp not implemented in Electron build')
}

export const releaseColor = (releaseType) => {
	switch (releaseType) {
		case 'release':
			return 'green'
		case 'beta':
			return 'orange'
		case 'alpha':
			return 'red'
		default:
			return ''
	}
}

export async function copyToClipboard(text) {
	await navigator.clipboard.writeText(text)
}
