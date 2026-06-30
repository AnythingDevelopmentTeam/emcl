const isTauri = typeof window !== 'undefined' && '__TAURI__' in window
const isElectron = typeof window !== 'undefined' && 'electronAPI' in window

let tauriListen = null

async function ensureTauriListen() {
	if (tauriListen) return
	try {
		const mod = await import('@tauri-apps/api/event')
		tauriListen = mod.listen
	} catch {}
}

export async function loading_listener(callback) {
	if (isElectron && window.electronAPI) {
		if (typeof window.electronAPI.utilsProgressBarsList !== 'function') return () => {}
		let lastIds = ''
		const timer = setInterval(async () => {
			try {
				const bars = await window.electronAPI.utilsProgressBarsList()
				const ids = (bars ?? []).map((b) => b.loading_bar_uuid).sort().join(',')
				if (ids && ids !== lastIds) {
					lastIds = ids
					for (const bar of bars ?? []) {
						callback({ event: bar })
					}
				}
			} catch {}
		}, 1000)
		return () => { clearInterval(timer) }
	}
	await ensureTauriListen()
	if (tauriListen) {
		return tauriListen('command', (event) => {
			if (event.payload?.event?.type?.startsWith('Loading')) {
				callback(event.payload)
			}
		})
	}
	return () => {}
}

export async function process_listener(callback) {
	if (isElectron && window.electronAPI) {
		if (typeof window.electronAPI.onCommand !== 'function') return () => {}
		return window.electronAPI.onCommand((payload) => {
			if (payload?.event === 'launched' || payload?.event === 'finished') {
				callback(payload)
			}
		})
	}
	await ensureTauriListen()
	if (tauriListen) {
		return tauriListen('process', (event) => {
			if (event.payload?.event === 'launched' || event.payload?.event === 'finished') {
				callback(event.payload)
			}
		})
	}
	return () => {}
}

export async function instance_listener(callback) {
	if (isElectron && window.electronAPI) {
		if (typeof window.electronAPI.onCommand !== 'function') return () => {}
		let lastIds = ''
		const timer = setInterval(async () => {
			try {
				const { list } = await import('@/helpers/instance')
				const instances = await list()
				const ids = instances.map((i) => i.id).sort().join(',')
				if (ids && ids !== lastIds) {
					lastIds = ids
					callback({ instance_id: 'poll' })
				}
			} catch {
			}
		}, 3000)
		const cleanup = window.electronAPI.onCommand((payload) => {
			if (payload?.instance_id) {
				callback(payload)
			}
		})
		return () => { cleanup(); clearInterval(timer) }
	}
	await ensureTauriListen()
	if (tauriListen) {
		return tauriListen('instance', (event) => {
			if (event.payload?.instance_id) {
				callback(event.payload)
			}
		})
	}
	return () => {}
}

export async function instance_bulk_update_progress_listener(callback) {
	if (isElectron && window.electronAPI) {
		if (typeof window.electronAPI.onCommand !== 'function') return () => {}
		return window.electronAPI.onCommand((payload) => {
			callback(payload)
		})
	}
	await ensureTauriListen()
	if (tauriListen) {
		return tauriListen('instance_bulk_update_progress', (event) => {
			callback(event.payload)
		})
	}
	return () => {}
}

export async function install_job_listener(callback) {
	if (isElectron && window.electronAPI) {
		if (typeof window.electronAPI.installJobList !== 'function') return () => {}
		let lastIds = ''
		const timer = setInterval(async () => {
			try {
				const jobs = await window.electronAPI.installJobList(true)
				const ids = (jobs ?? []).map((j) => j.job_id).sort().join(',')
				if (ids && ids !== lastIds) {
					lastIds = ids
					for (const job of jobs ?? []) {
						callback(job)
					}
				}
			} catch {}
		}, 1000)
		return () => { clearInterval(timer) }
	}
	await ensureTauriListen()
	if (tauriListen) {
		return tauriListen('command', (event) => {
			callback(event.payload)
		})
	}
	return () => {}
}

export async function command_listener(callback) {
	if (isElectron && window.electronAPI) {
		if (typeof window.electronAPI.onCommand !== 'function') return () => {}
		return window.electronAPI.onCommand((payload) => {
			callback(payload)
		})
	}
	await ensureTauriListen()
	if (tauriListen) {
		return tauriListen('command', (event) => {
			callback(event.payload)
		})
	}
	return () => {}
}

export async function warning_listener(callback) {
	if (isElectron && window.electronAPI) {
		if (typeof window.electronAPI.onNotification !== 'function') return () => {}
		return window.electronAPI.onNotification((payload) => {
			if (payload?.message) {
				callback(payload)
			}
		})
	}
	await ensureTauriListen()
	if (tauriListen) {
		return tauriListen('warning', (event) => {
			if (event.payload?.message) {
				callback(event.payload)
			}
		})
	}
	return () => {}
}

export async function friend_listener(callback) {
	if (isElectron && window.electronAPI) {
		return () => {}
	}
	await ensureTauriListen()
	if (tauriListen) {
		return tauriListen('friend', (event) => {
			callback(event.payload)
		})
	}
	return () => {}
}

export async function notification_listener(callback) {
	if (isElectron && window.electronAPI) {
		if (typeof window.electronAPI.onNotification !== 'function') return () => {}
		return window.electronAPI.onNotification((payload) => {
			callback(payload)
		})
	}
	await ensureTauriListen()
	if (tauriListen) {
		return tauriListen('notification', (event) => {
			callback(event.payload)
		})
	}
	return () => {}
}

export async function log_listener(callback) {
	if (isElectron && window.electronAPI) {
		return () => {}
	}
	await ensureTauriListen()
	if (tauriListen) {
		const unlisten1 = await tauriListen('log4j', (event) => {
			if (event.payload?.instance_id) {
				callback(event.payload)
			}
		})
		const unlisten2 = await tauriListen('legacy_log', (event) => {
			if (event.payload?.instance_id) {
				callback(event.payload)
			}
		})
		return () => { unlisten1(); unlisten2() }
	}
	return () => {}
}
