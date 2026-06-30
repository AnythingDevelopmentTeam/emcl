async function fetchJson(url) {
	try {
		const response = await fetch(url)
		if (!response.ok) return null
		return await response.json()
	} catch {
		return null
	}
}

const LOADER_META = {
	fabric: 'https://meta.fabricmc.net/v2/versions/loader',
	quilt: 'https://meta.quiltmc.org/v3/versions/loader',
}

export async function get_game_versions() {
	const data = await fetchJson('https://launchermeta.mojang.com/mc/game/version_manifest.json')
	if (!data) return null
	return {
		latest: data.latest,
		versions: data.versions.map((v) => ({
			id: v.id,
			type: v.type,
			url: v.url,
			time: v.time,
			releaseTime: v.releaseTime,
			sha1: v.sha1,
			complianceLevel: v.complianceLevel,
		})),
	}
}

export async function get_loader_versions(loader) {
	const metaUrl = LOADER_META[loader]
	if (!metaUrl) return null

	const data = await fetchJson(metaUrl)
	if (!data) return null

	// Fabric/Quilt v2/v3 API no longer returns minecraftVersion
	// Check if the response has the expected format
	if (data.length > 0 && !data[0].minecraftVersion) {
		return null
	}

	const versions = {}
	for (const entry of data) {
		const mcVersion = entry.minecraftVersion?.gameVersionId ?? entry.minecraftVersion
		if (!mcVersion) continue
		if (!versions[mcVersion]) {
			versions[mcVersion] = { id: mcVersion, stable: entry.stable ?? true, loaders: [] }
		}
		if (entry.loader) {
			versions[mcVersion].loaders.push({
				id: entry.loader.version,
				url: '',
				stable: entry.loader.stable ?? entry.stable ?? true,
			})
		}
	}

	return {
		gameVersions: Object.values(versions),
	}
}
