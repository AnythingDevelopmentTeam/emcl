export async function loading_listener(callback) {
	return window.electronAPI.onCommand((payload) => {
		if (payload?.event?.type?.startsWith('Loading')) {
			callback(payload)
		}
	})
}

export async function process_listener(callback) {
	return window.electronAPI.onCommand((payload) => {
		if (payload?.event === 'launched' || payload?.event === 'finished') {
			callback(payload)
		}
	})
}

export async function instance_listener(callback) {
	return window.electronAPI.onCommand((payload) => {
		if (payload?.instance_id) {
			callback(payload)
		}
	})
}

export async function instance_bulk_update_progress_listener(callback) {
	return window.electronAPI.onCommand(callback)
}

export async function install_job_listener(callback) {
	return window.electronAPI.onCommand(callback)
}

export async function command_listener(callback) {
	return window.electronAPI.onCommand(callback)
}

export async function warning_listener(callback) {
	return window.electronAPI.onCommand((payload) => {
		if (payload?.message) {
			callback(payload)
		}
	})
}

export async function friend_listener(callback) {
	return window.electronAPI.onCommand(callback)
}

export async function notification_listener(callback) {
	return window.electronAPI.onNotification(callback)
}

export async function log_listener(callback) {
	return window.electronAPI.onCommand((payload) => {
		if (payload?.instance_id && (payload?.type === 'log4j' || payload?.type === 'legacy')) {
			callback(payload)
		}
	})
}
