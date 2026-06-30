import { listen } from '@tauri-apps/api/event'

export async function loading_listener(callback) {
	return listen('command', (event) => {
		if (event.payload?.event?.type?.startsWith('Loading')) {
			callback(event.payload)
		}
	})
}

export async function process_listener(callback) {
	return listen('process', (event) => {
		if (event.payload?.event === 'launched' || event.payload?.event === 'finished') {
			callback(event.payload)
		}
	})
}

export async function instance_listener(callback) {
	return listen('instance', (event) => {
		if (event.payload?.instance_id) {
			callback(event.payload)
		}
	})
}

export async function instance_bulk_update_progress_listener(callback) {
	return listen('instance_bulk_update_progress', (event) => {
		callback(event.payload)
	})
}

export async function install_job_listener(callback) {
	return listen('command', (event) => {
		callback(event.payload)
	})
}

export async function command_listener(callback) {
	return listen('command', (event) => {
		callback(event.payload)
	})
}

export async function warning_listener(callback) {
	return listen('warning', (event) => {
		if (event.payload?.message) {
			callback(event.payload)
		}
	})
}

export async function friend_listener(callback) {
	return listen('friend', (event) => {
		callback(event.payload)
	})
}

export async function notification_listener(callback) {
	return listen('notification', (event) => {
		callback(event.payload)
	})
}

export async function log_listener(callback) {
	const unlisten1 = await listen('log4j', (event) => {
		if (event.payload?.instance_id) {
			callback(event.payload)
		}
	})
	const unlisten2 = await listen('legacy_log', (event) => {
		if (event.payload?.instance_id) {
			callback(event.payload)
		}
	})
	return () => { unlisten1(); unlisten2() }
}
