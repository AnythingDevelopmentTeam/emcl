export async function get_java_versions() {
	try {
		return await window.electronAPI.jreGetJavaVersions()
	} catch {
		return []
	}
}

export async function set_java_version(javaVersion) {
	try {
		return await window.electronAPI.jreSetJavaVersion(JSON.stringify(javaVersion))
	} catch {
	}
}

export async function find_filtered_jres(version) {
	throw new Error('find_filtered_jres not implemented in Electron build')
}

export async function get_jre(path) {
	throw new Error('get_jre not implemented in Electron build')
}

export async function test_jre(path, majorVersion) {
	throw new Error('test_jre not implemented in Electron build')
}

export async function auto_install_java(javaVersion) {
	try {
		return await window.electronAPI.jreAutoInstallJava(javaVersion)
	} catch {
		return null
	}
}

export async function get_max_memory() {
	try {
		return await window.electronAPI.jreGetMaxMemory()
	} catch {
		return null
	}
}
