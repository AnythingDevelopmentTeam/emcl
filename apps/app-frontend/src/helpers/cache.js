export async function get_project(id, cacheBehaviour) {
	try {
		return await window.electronAPI.cacheGetProject(id, cacheBehaviour ?? null)
	} catch {
		return null
	}
}

export async function get_project_many(ids, cacheBehaviour) {
	try {
		return await window.electronAPI.cacheGetProjectMany(ids, cacheBehaviour ?? null)
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
	try {
		return await window.electronAPI.cacheGetVersion(id, cacheBehaviour ?? null)
	} catch {
		return null
	}
}

export async function get_version_many(ids, cacheBehaviour) {
	try {
		return await window.electronAPI.cacheGetVersionMany(ids, cacheBehaviour ?? null)
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
	try {
		return await window.electronAPI.cacheGetUserMany(ids, cacheBehaviour ?? null)
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
	try {
		return await window.electronAPI.cacheGetTeamMany(ids, cacheBehaviour ?? null)
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

export async function get_search_results(id, cacheBehaviour) {
	try {
		return await window.electronAPI.cacheGetSearchResults(id, cacheBehaviour ?? null)
	} catch {
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
	throw new Error('get_project_versions not implemented in Electron build')
}
