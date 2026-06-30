export async function get_project(id, cacheBehaviour) {
	if (id == null) return null
	try {
		return await window.electronAPI.cacheGetProject(id, cacheBehaviour ?? null)
	} catch {
		return null
	}
}

export async function get_project_many(ids, cacheBehaviour) {
	if (ids == null || !ids.length) return []
	const cleaned = ids.filter((id) => id != null)
	if (!cleaned.length) return []
	try {
		return await window.electronAPI.cacheGetProjectMany(cleaned, cacheBehaviour ?? null)
	} catch {
		return []
	}
}

export async function get_project_v3(id, cacheBehaviour) {
	throw new Error('get_project_v3 not implemented in Electron build')
}

export async function get_project_v3_many(ids, cacheBehaviour) {
	throw new Error('get_project_v3_many not implemented in Electron build')
}

export async function get_version(id, cacheBehaviour) {
	if (id == null) return null
	try {
		return await window.electronAPI.cacheGetVersion(id, cacheBehaviour ?? null)
	} catch {
		return null
	}
}

export async function get_version_many(ids, cacheBehaviour) {
	if (ids == null || !ids.length) return []
	const cleaned = ids.filter((id) => id != null)
	if (!cleaned.length) return []
	try {
		return await window.electronAPI.cacheGetVersionMany(cleaned, cacheBehaviour ?? null)
	} catch {
		return []
	}
}

export async function get_user(id, cacheBehaviour) {
	try {
		return await window.electronAPI.cacheGetUser(id, cacheBehaviour ?? null)
	} catch {
		return null
	}
}

export async function get_user_many(ids, cacheBehaviour) {
	if (ids == null || !ids.length) return []
	const cleaned = ids.filter((id) => id != null)
	if (!cleaned.length) return []
	try {
		return await window.electronAPI.cacheGetUserMany(cleaned, cacheBehaviour ?? null)
	} catch {
		return []
	}
}

export async function get_team(id, cacheBehaviour) {
	try {
		return await window.electronAPI.cacheGetTeam(id, cacheBehaviour ?? null)
	} catch {
		return null
	}
}

export async function get_team_many(ids, cacheBehaviour) {
	if (ids == null || !ids.length) return []
	const cleaned = ids.filter((id) => id != null)
	if (!cleaned.length) return []
	try {
		return await window.electronAPI.cacheGetTeamMany(cleaned, cacheBehaviour ?? null)
	} catch {
		return []
	}
}

export async function get_organization(id, cacheBehaviour) {
	throw new Error('get_organization not implemented in Electron build')
}

export async function get_organization_many(ids, cacheBehaviour) {
	throw new Error('get_organization_many not implemented in Electron build')
}

export async function get_search_results(url, cacheBehaviour) {
	try {
		if (!url) {
			console.error('[cache] get_search_results called with empty URL')
			return null
		}
		const result = await window.electronAPI.cacheGetSearchResults(url, cacheBehaviour ?? null)
		if (!result) console.error('[cache] get_search_results returned null for:', url.substring(0, 120))
		return result
	} catch (e) {
		console.error('[cache] get_search_results error:', e, 'URL:', url?.substring(0, 120))
		return null
	}
}

export async function get_search_results_many(ids, cacheBehaviour) {
	throw new Error('get_search_results_many not implemented in Electron build')
}

export async function get_search_results_v3(id, cacheBehaviour) {
	throw new Error('get_search_results_v3 not implemented in Electron build')
}

export async function get_search_results_v3_many(ids, cacheBehaviour) {
	throw new Error('get_search_results_v3_many not implemented in Electron build')
}

export async function purge_cache_types(cacheTypes) {
	try {
		return await window.electronAPI.cachePurgeTypes(cacheTypes)
	} catch {
	}
}

export async function get_project_versions(projectId, cacheBehaviour) {
	try {
		const response = await fetch(`https://api.modrinth.com/v2/project/${projectId}/version`)
		if (!response.ok) return []
		return await response.json()
	} catch {
		return []
	}
}
