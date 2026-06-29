export function getNative(): ElectronAPI {
	if (!window.electronAPI) {
		throw new Error('electronAPI not available - not running in Electron')
	}
	return window.electronAPI
}
