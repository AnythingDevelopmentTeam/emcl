export type ModrinthCredentials = {
	session: string
	expires: string
	user_id: string
	active: boolean
}

export async function login(): Promise<ModrinthCredentials | null> {
	try {
		const result = await window.electronAPI.mrAuthLogin()
		return result
	} catch {
		return null
	}
}

export async function logout(): Promise<void> {
	try {
		return await window.electronAPI.mrAuthLogout()
	} catch {
	}
}

export async function get(): Promise<ModrinthCredentials | null> {
	try {
		return await window.electronAPI.mrAuthGet()
	} catch {
		return null
	}
}

export async function cancelLogin(): Promise<void> {
	return null
}
