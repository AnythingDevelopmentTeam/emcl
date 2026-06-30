/**
 * All theseus API calls return serialized values (both return values and errors);
 * So, for example, addDefaultInstance creates a blank instance object, where the Rust struct is serialized,
 *  and deserialized into a usable JS object.
 */

/**
 * Check if the authentication servers are reachable, throwing an exception if
 * not reachable.
 */
export async function check_reachable() {
	try {
		await window.electronAPI.authCheckReachable()
	} catch {
	}
}

/**
 * Authenticate a user with Microsoft OAuth.
 * Opens an Electron window for the user to sign in.
 *
 * @returns {Promise<Object|null>} A Credentials object with user profile, or null if cancelled.
 */
export async function login() {
	try {
		return await window.electronAPI.authLogin()
	} catch {
		return null
	}
}

/**
 * Create an offline Minecraft account.
 *
 * @param {string} username - The username for the offline account
 * @returns {Promise<Object>} A Credentials object for the offline user.
 */
export async function create_offline(username) {
	return await window.electronAPI.authCreateOffline(username)
}

/**
 * Retrieves the default user
 * @return {Promise<string | undefined>}
 */
export async function get_default_user() {
	try {
		return await window.electronAPI.authGetDefaultUser()
	} catch {
		return ''
	}
}

/**
 * Updates the default user
 * @param {string} user - UUID of the user
 */
export async function set_default_user(user) {
	try {
		return await window.electronAPI.authSetDefaultUser(user)
	} catch {
	}
}

/**
 * Remove a user account from the database
 * @param {string} user - UUID of the user
 */
export async function remove_user(user) {
	try {
		return await window.electronAPI.authRemoveUser(user)
	} catch {
	}
}

/**
 * Returns a list of users
 * @returns {Promise<Object[]>}
 */
export async function users() {
	try {
		return await window.electronAPI.authGetUsers()
	} catch {
		return []
	}
}
