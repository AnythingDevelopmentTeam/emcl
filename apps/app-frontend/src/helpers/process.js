export async function get_by_instance_id(instanceId) {
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
