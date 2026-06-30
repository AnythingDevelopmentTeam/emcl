export async function get_by_instance_id(instanceId) {
	if (instanceId == null) {
		console.warn('[process] get_by_instance_id called with null/undefined id')
		return null
	}
	try {
		return await window.electronAPI.processGetByInstanceId(instanceId)
	} catch {
		return null
	}
}

export async function get_all() {
	try {
		return await window.electronAPI.processGetAll()
	} catch {
		return []
	}
}

export async function kill(uuid) {
	try {
		return await window.electronAPI.processKill(uuid)
	} catch {
	}
}
