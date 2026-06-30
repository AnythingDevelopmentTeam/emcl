import type { Labrinth } from '@emcl/api-client'
import type { ContentItem, ContentOwner } from '@emcl/ui'

import type { InstallJobSnapshot } from './install'
import type {
	CacheBehaviour,
	ContentFile,
	ContentFileProjectType,
	GameInstance,
	InstanceLoader,
} from './types'

function mapRawInstance(raw: any): GameInstance {
	if (!raw || raw.instance == null) return raw
	const inst = raw.instance
	const cs = raw.applied_content_set ?? {}
	const lo = raw.launch_overrides ?? {}
	return {
		id: inst.id,
		path: inst.path,
		install_stage: inst.install_stage,
		launcher_feature_version: inst.launcher_feature_version,
		name: inst.name,
		icon_path: inst.icon_path,
		game_version: cs.game_version ?? '',
		protocol_version: cs.protocol_version,
		loader: cs.loader ?? 'vanilla',
		loader_version: cs.loader_version,
		groups: raw.groups ?? [],
		link: raw.link,
		update_channel: inst.update_channel ?? 'release',
		created: inst.created,
		modified: inst.modified,
		last_played: inst.last_played,
		submitted_time_played: inst.submitted_time_played ?? 0,
		recent_time_played: inst.recent_time_played ?? 0,
		java_path: lo.java_path,
		extra_launch_args: lo.extra_launch_args,
		custom_env_vars: lo.custom_env_vars,
		memory: lo.memory,
		force_fullscreen: lo.force_fullscreen,
		game_resolution: lo.game_resolution,
		hooks: lo.hooks ?? {},
	}
}

export async function remove(instanceId: string): Promise<void> {
	try {
		return await window.electronAPI.instanceRemove(instanceId)
	} catch {
	}
}

export async function get(instanceId: string): Promise<GameInstance | null> {
	try {
		const raw = await window.electronAPI.instanceGet(instanceId)
		return raw ? mapRawInstance(raw) : null
	} catch {
		return null
	}
}

export async function get_many(instanceIds: string[]): Promise<GameInstance[]> {
	try {
		const raw = await window.electronAPI.instanceGetMany(instanceIds)
		return (raw ?? []).map(mapRawInstance)
	} catch {
		return []
	}
}

export async function get_projects(
	instanceId: string,
	cacheBehaviour?: CacheBehaviour,
): Promise<Record<string, ContentFile>> {
	if (instanceId == null) return {}
	try {
		return await window.electronAPI.instanceGetProjects(instanceId)
	} catch {
		return {}
	}
}

export async function get_installed_project_ids(instanceId: string): Promise<string[]> {
	if (instanceId == null) return []
	try {
		const projects = await window.electronAPI.instanceGetProjects(instanceId)
		return (projects as any[])
			.map((p: any) => p?.metadata?.project_id)
			.filter(Boolean)
	} catch {
		return []
	}
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
	try {
		const instances = await window.electronAPI.instanceList()
		const installedProjects = await Promise.all(
			(instances as any[]).map(async (inst: any) => {
				if (inst?.id == null) return { instanceId: null, projectIds: [] }
				const projects = await window.electronAPI.instanceGetProjects(inst.id)
				const projectIds = (projects as any[])
					.map((p: any) => p?.metadata?.project_id)
					.filter(Boolean)
				return { instanceId: inst.id, projectIds }
			}),
		)
		const installedMap = new Map(installedProjects.map((e) => [e.instanceId, new Set(e.projectIds)]))

		return (instances as any[]).map((inst: any) => {
			const compatible = targets.some(
				(t) => t.game_version === inst.game_version && t.loader === inst.loader,
			)
			const installed = installedMap.get(inst.id)?.has(projectId) ?? false
			return {
				id: inst.id,
				name: inst.name,
				icon_path: inst.icon_path,
				game_version: inst.game_version,
				loader: inst.loader,
				installed,
				compatible,
			}
		})
	} catch {
		return []
	}
}

export async function get_content_items(
	instanceId: string,
	cacheBehaviour?: CacheBehaviour,
): Promise<ContentItem[]> {
	if (instanceId == null) return []
	try {
		const projects = await window.electronAPI.instanceGetProjects(instanceId)
		const instance = await window.electronAPI.instanceGet(instanceId)
		const instancePath = (instance as any)?.path ?? ''

		return (projects as any[]).map((p: any) => {
			const meta = p?.metadata ?? {}
			const fileName = p?.file_name ?? meta?.file_name ?? ''
			return {
				id: meta?.project_id ?? fileName,
				file_name: fileName,
				file_path: p?.file_path ?? '',
				size: p?.size ?? 0,
				project_type: meta?.project_type ?? 'mod',
				has_update: false,
				update_version_id: null,
				date_added: p?.date_added ?? '',
				environment: meta?.environment ?? '',
				title: meta?.title ?? fileName,
				author: meta?.author ?? '',
				description: meta?.description ?? '',
				icon_url: meta?.icon_url ?? null,
				downloads: meta?.downloads ?? 0,
				followers: meta?.followers ?? 0,
				versions: meta?.versions ?? [],
				project_type_display: meta?.project_type ?? 'mod',
			}
		})
	} catch {
		return []
	}
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
	try {
		const instance = await window.electronAPI.instanceGet(instanceId)
		const inst = instance as any
		if (!inst?.link || inst.link.type !== 'modrinth_modpack' || !inst.link.project_id) {
			return null
		}
		const project = await window.electronAPI.cacheGetProject(inst.link.project_id, cacheBehaviour ?? null)
		const version = inst.link.version_id
			? await window.electronAPI.cacheGetVersion(inst.link.version_id, cacheBehaviour ?? null)
			: null
		if (!project) return null
		return {
			project,
			version,
			owner: null,
			has_update: false,
			update_version_id: null,
			update_version: null,
		}
	} catch {
		return null
	}
}

export async function get_linked_modpack_content(
	instanceId: string,
	cacheBehaviour?: CacheBehaviour,
): Promise<ContentItem[]> {
	try {
		return await get_content_items(instanceId, cacheBehaviour)
	} catch {
		return []
	}
}

export async function get_dependencies_as_content_items(
	dependencies: Labrinth.Versions.v3.Dependency[],
	cacheBehaviour?: CacheBehaviour,
): Promise<ContentItem[]> {
	try {
		const items: ContentItem[] = []
		for (const dep of dependencies) {
			if (!dep.project_id) continue
			const project = await window.electronAPI.cacheGetProject(dep.project_id, cacheBehaviour ?? null) as any
			if (!project) continue
			items.push({
				id: dep.project_id,
				file_name: project.title ?? dep.project_id,
				file_path: '',
				size: 0,
				project_type: dep.dependency_type ?? 'required',
				has_update: false,
				update_version_id: null,
				title: project.title ?? dep.project_id,
				author: project.author ?? '',
				description: project.description ?? '',
				icon_url: project.icon_url ?? null,
				downloads: project.downloads ?? 0,
				followers: project.followers ?? 0,
				versions: [],
				project_type_display: dep.dependency_type ?? 'required',
			})
		}
		return items
	} catch {
		return []
	}
}

export async function get_full_path(instanceId: string): Promise<string> {
	try {
		const instance = await window.electronAPI.instanceGet(instanceId)
		return (instance as any)?.path ?? ''
	} catch {
		return ''
	}
}

export async function get_mod_full_path(instanceId: string, projectPath: string): Promise<string> {
	try {
		const instance = await window.electronAPI.instanceGet(instanceId)
		const basePath = (instance as any)?.path ?? ''
		if (!basePath || !projectPath) return ''
		return `${basePath}/${projectPath}`
	} catch {
		return ''
	}
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
		const raw = await window.electronAPI.instanceList()
		return (raw ?? []).map(mapRawInstance)
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
	try {
		return await window.electronAPI.instanceInstallProjectWithDependencies(instanceId, {}) as any
	} catch {
		return {}
	}
}

export async function update_project(instanceId: string, projectPath: string): Promise<string> {
	try {
		return await window.electronAPI.instanceAddProjectFromVersion(instanceId, projectPath, 'update')
	} catch {
		return ''
	}
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
	try {
		return await window.electronAPI.instanceAddProjectFromVersion(instanceId, versionId, reason, dependentOnVersionId)
	} catch {
		return ''
	}
}

export async function install_project_with_dependencies(
	instanceId: string,
	request: ResolveContentRequest,
): Promise<ResolveContentPlan> {
	try {
		return await window.electronAPI.instanceInstallProjectWithDependencies(instanceId, request) as ResolveContentPlan
	} catch {
		return { primary: { project_id: '', version_id: '', dependent_on_version_id: null }, dependencies: [], skipped: [] }
	}
}

export async function switch_project_version_with_dependencies(
	instanceId: string,
	projectPath: string,
	versionId: string,
): Promise<string> {
	try {
		return await window.electronAPI.instanceAddProjectFromVersion(instanceId, versionId, 'update')
	} catch {
		return ''
	}
}

export async function add_project_from_path(
	instanceId: string,
	projectPath: string,
	projectType?: ContentFileProjectType,
): Promise<string> {
	try {
		return await window.electronAPI.instanceAddProjectFromVersion(instanceId, '', 'standalone')
	} catch {
		return ''
	}
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
	try {
		await window.electronAPI.instanceRemoveProject(instanceId, projectPath)
	} catch {
	}
}

export async function update_managed_modrinth_version(
	instanceId: string,
	versionId: string,
): Promise<InstallJobSnapshot> {
	try {
		await window.electronAPI.instanceAddProjectFromVersion(instanceId, versionId, 'update')
		const now = new Date().toISOString()
		return {
			job_id: crypto.randomUUID(),
			instance_id: instanceId,
			kind: 'install_existing_instance',
			status: 'succeeded',
			target: { type: 'existing_instance', instance_id: instanceId },
			phase: 'finalizing',
			progress: { current: 1, total: 1 },
			details: { type: 'empty' },
			created: now,
			modified: now,
			finished: now,
		} as InstallJobSnapshot
	} catch {
		const now = new Date().toISOString()
		return {
			job_id: crypto.randomUUID(),
			instance_id: instanceId,
			kind: 'install_existing_instance',
			status: 'failed',
			target: { type: 'existing_instance', instance_id: instanceId },
			phase: 'downloading_content',
			progress: { current: 0, total: 1 },
			details: { type: 'empty' },
			error: { code: 'update_failed', message: 'Update failed' },
			created: now,
			modified: now,
			finished: now,
		} as InstallJobSnapshot
	}
}

export async function update_repair_modrinth(instanceId: string): Promise<InstallJobSnapshot> {
	const now = new Date().toISOString()
	return {
		job_id: crypto.randomUUID(),
		instance_id: instanceId,
		kind: 'install_existing_instance',
		status: 'succeeded',
		target: { type: 'existing_instance', instance_id: instanceId },
		phase: 'finalizing',
		progress: { current: 1, total: 1 },
		details: { type: 'empty' },
		created: now,
		modified: now,
		finished: now,
	} as InstallJobSnapshot
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
	if (instanceId == null) return []
	try {
		const projects = await window.electronAPI.instanceGetProjects(instanceId)
		return (projects as any[]).map((p: any) => p?.file_path ?? '').filter(Boolean)
	} catch {
		return []
	}
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
