const API_BASE = 'https://api.modrinth.com'

async function fetchTag(endpoint) {
	try {
		const response = await fetch(`${API_BASE}/v2/tag/${endpoint}`)
		if (!response.ok) return []
		return await response.json()
	} catch {
		return []
	}
}

export async function get_categories() {
	return fetchTag('category')
}

export async function get_loaders() {
	return fetchTag('loader')
}

export async function get_game_versions() {
	return fetchTag('game_version')
}

export async function get_donation_platforms() {
	return fetchTag('donation_platform')
}

export async function get_report_types() {
	return fetchTag('report_type')
}
