import type { Labrinth } from '@modrinth/api-client'
import type { ContentItem, ContentOwner } from '@modrinth/ui'

import type { InstallJobSnapshot } from './install'
import type {
	CacheBehaviour,
	ContentFile,
	ContentFileProjectType,
	GameInstance,
	InstanceLoader,
} from './types'

export async function remove(instanceId: string): Promise<void> {
	try {
		return await window.electronAPI.instanceRemove(instanceId)
	} catch {
	}
}

export async function get(instanceId: string): Promise<GameInstance | null> {
	try {
		return await window.electronAPI.instanceGet(instanceId)
	} catch {
		return null
	}
}

export async function get_many(instanceIds: string[]): Promise<GameInstance[]> {
	try {
		return await window.electronAPI.instanceGetMany(instanceIds)
	} catch {
		return []
	}
}

export async function get_projects(
	instanceId: string,
	cacheBehaviour?: CacheBehaviour,
): Promise<Record<string, ContentFile>> {
	try {
		return await window.electronAPI.instanceGetProjects(instanceId)
	} catch {
		return {}
	}
}

export async function get_installed_project_ids(instanceId: string): Promise<string[]> {
	throw new Error('get_installed_project_ids not implemented in Electron build')
}

export type InstanceInstallTarget = {
	game_version: string
	loader: string
}

export type InstanceInstallCandidate = {
	id: string
	name: string
	icon_path?: string | null
	game_version: string
	loader: InstanceLoader
	installed: boolean
	compatible: boolean
}

export async function get_install_candidates(
	projectId: string,
	projectType: string,
	targets: InstanceInstallTarget[],
): Promise<InstanceInstallCandidate[]> {
	throw new Error('get_install_candidates not implemented in Electron build')
}

export async function get_content_items(
	instanceId: string,
	cacheBehaviour?: CacheBehaviour,
): Promise<ContentItem[]> {
	throw new Error('get_content_items not implemented in Electron build')
}

export interface LinkedModpackInfo {
	project: Labrinth.Projects.v2.Project
	version: Labrinth.Versions.v2.Version
	owner: ContentOwner | null
	has_update: boolean
	update_version_id: string | null
	update_version: Labrinth.Versions.v2.Version | null
}

export async function get_linked_modpack_info(
	instanceId: string,
	cacheBehaviour?: CacheBehaviour,
): Promise<LinkedModpackInfo | null> {
	throw new Error('get_linked_modpack_info not implemented in Electron build')
}

export async function get_linked_modpack_content(
	instanceId: string,
	cacheBehaviour?: CacheBehaviour,
): Promise<ContentItem[]> {
	throw new Error('get_linked_modpack_content not implemented in Electron build')
}

export async function get_dependencies_as_content_items(
	dependencies: Labrinth.Versions.v3.Dependency[],
	cacheBehaviour?: CacheBehaviour,
): Promise<ContentItem[]> {
	throw new Error('get_dependencies_as_content_items not implemented in Electron build')
}

export async function get_full_path(instanceId: string): Promise<string> {
	throw new Error('get_full_path not implemented in Electron build')
}

export async function get_mod_full_path(instanceId: string, projectPath: string): Promise<string> {
	throw new Error('get_mod_full_path not implemented in Electron build')
}

export interface JavaVersion {
	parsed_version: number
	version: string
	architecture: string
	path: string
}

export async function get_optimal_jre_key(instanceId: string): Promise<JavaVersion | null> {
	try {
		return await window.electronAPI.instanceGetOptimalJreKey(instanceId)
	} catch {
		return null
	}
}

export async function list(): Promise<GameInstance[]> {
	try {
		return await window.electronAPI.instanceList()
	} catch {
		return []
	}
}

export async function check_installed(instanceId: string, projectId: string): Promise<boolean> {
	try {
		return await window.electronAPI.instanceCheckInstalled(instanceId, projectId)
	} catch {
		return false
	}
}

export async function update_all(instanceId: string): Promise<Record<string, string>> {
	throw new Error('update_all not implemented in Electron build')
}

export async function update_project(instanceId: string, projectPath: string): Promise<string> {
	throw new Error('update_project not implemented in Electron build')
}

export type DownloadReason = 'standalone' | 'dependency' | 'modpack' | 'update'

export interface ResolutionPreferences {
	game_versions?: string[]
	loaders?: string[]
}

export interface ResolveContentRequest {
	project_id: string
	version_id?: string | null
	content_type: Labrinth.Content.v3.ContentType
	selected?: ResolutionPreferences
}

export interface ResolvedContent {
	project_id: string
	version_id: string
	dependent_on_version_id?: string | null
}

export interface ResolveContentPlan {
	primary: ResolvedContent
	dependencies: ResolvedContent[]
	skipped: Array<{
		project_id: string
		version_id?: string | null
		dependent_on_version_id?: string | null
		reason: string
	}>
}

export async function add_project_from_version(
	instanceId: string,
	versionId: string,
	reason: DownloadReason,
	dependentOnVersionId?: string,
): Promise<string> {
	throw new Error('add_project_from_version not implemented in Electron build')
}

export async function install_project_with_dependencies(
	instanceId: string,
	request: ResolveContentRequest,
): Promise<ResolveContentPlan> {
	throw new Error('install_project_with_dependencies not implemented in Electron build')
}

export async function switch_project_version_with_dependencies(
	instanceId: string,
	projectPath: string,
	versionId: string,
): Promise<string> {
	throw new Error('switch_project_version_with_dependencies not implemented in Electron build')
}

export async function add_project_from_path(
	instanceId: string,
	projectPath: string,
	projectType?: ContentFileProjectType,
): Promise<string> {
	throw new Error('add_project_from_path not implemented in Electron build')
}

export async function toggle_disable_project(
	instanceId: string,
	projectPath: string,
	desiredEnabled?: boolean,
): Promise<string> {
	try {
		return await window.electronAPI.instanceToggleDisableProject(instanceId, projectPath, desiredEnabled)
	} catch {
		return ''
	}
}

export async function remove_project(instanceId: string, projectPath: string): Promise<void> {
	throw new Error('remove_project not implemented in Electron build')
}

export async function update_managed_modrinth_version(
	instanceId: string,
	versionId: string,
): Promise<InstallJobSnapshot> {
	throw new Error('update_managed_modrinth_version not implemented in Electron build')
}

export async function update_repair_modrinth(instanceId: string): Promise<InstallJobSnapshot> {
	throw new Error('update_repair_modrinth not implemented in Electron build')
}

export async function export_instance_mrpack(
	instanceId: string,
	exportLocation: string,
	includedOverrides: string[],
	versionId?: string,
	description?: string,
	name?: string,
): Promise<void> {
	try {
		return await window.electronAPI.instanceExportMrpack(
			instanceId,
			exportLocation,
			includedOverrides,
			versionId ?? null,
			description ?? null,
			name ?? null,
		)
	} catch {
	}
}

export async function get_pack_export_candidates(instanceId: string): Promise<string[]> {
	throw new Error('get_pack_export_candidates not implemented in Electron build')
}

export async function run(
	instanceId: string,
	serverAddress: string | null = null,
): Promise<unknown> {
	try {
		return await window.electronAPI.instanceRun(instanceId)
	} catch {
		return null
	}
}

export async function kill(instanceId: string): Promise<void> {
	try {
		return await window.electronAPI.instanceKill(instanceId)
	} catch {
	}
}

export async function edit(instanceId: string, editInstance: Partial<GameInstance>): Promise<void> {
	try {
		return await window.electronAPI.instanceEdit(instanceId, JSON.stringify(editInstance))
	} catch {
	}
}

export async function edit_icon(instanceId: string, iconPath: string | null): Promise<void> {
	try {
		return await window.electronAPI.instanceEditIcon(instanceId, iconPath ?? null)
	} catch {
	}
}
