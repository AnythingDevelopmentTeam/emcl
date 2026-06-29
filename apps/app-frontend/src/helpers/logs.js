export async function get_logs(instanceId, clearContents) {
	try {
		return await window.electronAPI.logsGetLogs(instanceId, clearContents ?? null)
	} catch {
		return []
	}
}

export async function get_logs_by_filename(instanceId, logType, filename) {
	try {
		return await window.electronAPI.logsGetByFilename(instanceId, logType, filename)
	} catch {
		return []
	}
}

export async function get_output_by_filename(instanceId, logType, filename) {
	throw new Error('get_output_by_filename not implemented in Electron build')
}

export async function delete_logs_by_filename(instanceId, logType, filename) {
	throw new Error('delete_logs_by_filename not implemented in Electron build')
}

export async function delete_logs(instanceId) {
	try {
		return await window.electronAPI.logsDeleteLogs(instanceId)
	} catch {
	}
}

export async function get_latest_log_cursor(instanceId, cursor) {
	try {
		return await window.electronAPI.logsGetLatestLogCursor(instanceId, cursor)
	} catch {
		return null
	}
}

export async function get_live_log_buffer(instanceId) {
	try {
		return await window.electronAPI.logsGetLiveLogBuffer(instanceId)
	} catch {
		return null
	}
}

export async function clear_log_buffer(instanceId) {
	try {
		return await window.electronAPI.logsClearLiveLogBuffer(instanceId)
	} catch {
	}
}
