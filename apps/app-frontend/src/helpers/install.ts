import { install_job_listener } from './events'
import { invoke } from './tauri-compat'
import type { InstanceLink, InstanceLoader } from './types'

function convertLinkForRust(link: InstanceLink | null | undefined): string | null {
	if (!link) return null
	const { type, ...rest } = link as any
	return JSON.stringify({ [type]: rest })
}

export interface PackLocationVersionId {
	type: 'fromVersionId'
	project_id: string
	version_id: string
	title: string
	icon_url?: string | null
}

export interface PackLocationFile {
	type: 'fromFile'
	path: string
}

export type CreatePackLocation = PackLocationVersionId | PackLocationFile

export interface InstallModpackPreview {
	name: string
	gameVersion: string
	modloader: InstanceLoader
	loaderVersion: string | null
	icon?: string | null
	iconUrl?: string | null
	link?: InstanceLink | null
	unknownFile: boolean
}

export interface InstallCreateInstanceRequest {
	name: string
	gameVersion: string
	loader: InstanceLoader
	loaderVersion: string | null
	iconPath: string | null
	link?: InstanceLink | null
}

export interface InstallPostInstallEdit {
	name?: string | null
	iconPath?: string | null
	link?: InstanceLink | null
}

export type InstallJobStatus =
	| 'queued'
	| 'running'
	| 'succeeded'
	| 'failed'
	| 'interrupted'
	| 'canceled'

export type InstallPhaseId =
	| 'preparing_instance'
	| 'resolving_pack'
	| 'downloading_pack_file'
	| 'reading_pack_manifest'
	| 'downloading_content'
	| 'extracting_overrides'
	| 'resolving_minecraft'
	| 'resolving_loader'
	| 'preparing_java'
	| 'downloading_minecraft'
	| 'running_loader_processors'
	| 'finalizing'
	| 'rolling_back'

export interface InstallProgress {
	current: number
	total: number
	secondary?: InstallProgressSecondary | null
}

export interface InstallProgressSecondary {
	current: number
	total: number
}

export type InstallJavaStep =
	| 'resolving'
	| 'fetching_metadata'
	| 'downloading'
	| 'extracting'
	| 'validating'

export interface InstallJobSnapshot {
	job_id: string
	instance_id?: string | null
	kind:
		| 'create_instance'
		| 'create_modpack_instance'
		| 'import_instance'
		| 'duplicate_instance'
		| 'install_existing_instance'
		| 'install_pack_to_existing_instance'
	status: InstallJobStatus
	target:
		| { type: 'new_instance'; instance_id?: string | null }
		| { type: 'existing_instance'; instance_id: string }
	phase: InstallPhaseId
	progress?: InstallProgress | null
	details:
		| { type: 'empty' }
		| { type: 'instance'; name: string }
		| { type: 'minecraft'; game_version: string; loader: InstanceLoader }
		| { type: 'java'; major_version: number; step: InstallJavaStep }
		| {
				type: 'modpack'
				project_id?: string | null
				version_id?: string | null
				title?: string | null
		  }
		| { type: 'import'; launcher_type: string; instance_folder: string }
	display?: { title: string; icon?: string | null } | null
	error?: { code: string; message: string } | null
	created: string
	modified: string
	finished?: string | null
}

export async function install_get_modpack_preview(location: CreatePackLocation) {
	try {
		if (location.type === 'fromVersionId') {
			const res = await fetch(`https://api.modrinth.com/v2/version/${location.version_id}`)
			if (!res.ok) throw new Error('Failed to fetch version')
			const version = await res.json()
			const projectRes = await fetch(`https://api.modrinth.com/v2/project/${location.project_id}`)
			const project = projectRes.ok ? await projectRes.json() : null
			return {
				name: location.title,
				gameVersion: version.game_versions?.[0] ?? '1.20',
				modloader: (version.loaders?.[0] ?? 'neoforge') as InstanceLoader,
				loaderVersion: null,
				icon: null,
				iconUrl: location.icon_url ?? project?.icon_url ?? null,
				link: {
					type: 'modrinth_modpack',
					project_id: location.project_id,
					version_id: location.version_id,
				},
				unknownFile: false,
			} as InstallModpackPreview
		}
		return {
			name: 'Unknown Modpack',
			gameVersion: '1.20',
			modloader: 'neoforge' as InstanceLoader,
			loaderVersion: null,
			icon: null,
			iconUrl: null,
			link: null,
			unknownFile: true,
		} as InstallModpackPreview
	} catch {
		return {
			name: 'Unknown Modpack',
			gameVersion: '1.20',
			modloader: 'neoforge' as InstanceLoader,
			loaderVersion: null,
			icon: null,
			iconUrl: null,
			link: null,
			unknownFile: true,
		} as InstallModpackPreview
	}
}

export async function install_create_instance(request: InstallCreateInstanceRequest) {
	try {
		return await window.electronAPI.installCreateInstance(
			request.name,
			request.gameVersion,
			request.loader,
			request.loaderVersion ?? null,
			request.iconPath ?? null,
			convertLinkForRust(request.link),
		)
	} catch {
		return null
	}
}

export async function install_create_modpack_instance(
	location: CreatePackLocation,
	postInstallEdit?: InstallPostInstallEdit | null,
): Promise<InstallJobSnapshot | null> {
	try {
		if (location.type === 'fromVersionId') {
			const res = await fetch(`https://api.modrinth.com/v2/version/${location.version_id}`)
			if (!res.ok) return null
			const version = await res.json()
			const gameVersion = version.game_versions?.[0] ?? '1.20'
			const loader = (version.loaders?.[0] ?? 'neoforge') as InstanceLoader

			const result = await window.electronAPI.installCreateInstance(
				location.title ?? 'Modpack',
				gameVersion,
				loader,
				null,
				null,
				convertLinkForRust({
					type: 'modrinth_modpack',
					project_id: location.project_id,
					version_id: location.version_id,
				}),
			)
			if (!result) return null

			const jobId = crypto.randomUUID()
			const now = new Date().toISOString()
			return {
				job_id: jobId,
				instance_id: result.instance_id ?? result.id ?? null,
				kind: 'create_modpack_instance',
				status: 'succeeded',
				target: {
					type: 'new_instance',
					instance_id: result.instance_id ?? result.id ?? null,
				},
				phase: 'finalizing',
				progress: { current: 1, total: 1 },
				details: {
					type: 'modpack',
					project_id: location.project_id,
					version_id: location.version_id,
					title: location.title ?? null,
				},
				display: { title: location.title ?? 'Modpack', icon: location.icon_url ?? null },
				created: now,
				modified: now,
				finished: now,
			} as InstallJobSnapshot
		}
		return null
	} catch {
		return null
	}
}

export async function install_import_instance(
	launcherType: string,
	basePath: string,
	instanceFolder: string,
) {
	try {
		const result = await window.electronAPI.installCreateInstance(
			`Imported (${instanceFolder})`,
			'1.20',
			'neoforge',
			null,
			null,
			null,
		)
		return result
	} catch {
		return null
	}
}

export async function install_duplicate_instance(sourceInstanceId: string) {
	try {
		const instance = await window.electronAPI.instanceGet(sourceInstanceId)
		if (!instance) return null
		const inst = instance as any
		const result = await window.electronAPI.installCreateInstance(
			`${inst.name ?? 'Instance'} (Copy)`,
			inst.game_version ?? '1.20',
			inst.loader ?? 'neoforge',
			inst.loader_version ?? null,
			null,
			inst.link ? JSON.stringify(inst.link) : null,
		)
		return result
	} catch {
		return null
	}
}

export async function install_existing_instance(instanceId: string, force: boolean) {
	try {
		const instance = await window.electronAPI.instanceGet(instanceId)
		return instance
	} catch {
		return null
	}
}

export async function install_pack_to_existing_instance(
	instanceId: string,
	location: CreatePackLocation,
	postInstallEdit?: InstallPostInstallEdit | null,
) {
	try {
		if (location.type === 'fromVersionId') {
			const instance = await window.electronAPI.instanceGet(instanceId)
			if (!instance) return null
			const link = convertLinkForRust({
				type: 'modrinth_modpack',
				project_id: location.project_id,
				version_id: location.version_id,
			})
			await window.electronAPI.instanceEdit(
				instanceId,
				JSON.stringify({ link: JSON.parse(link as string) }),
			)
		}
		return null
	} catch {
		return null
	}
}

export async function install_job_list(includeFinished: boolean) {
	try {
		return await window.electronAPI.installJobList(includeFinished)
	} catch {
		return []
	}
}

export async function install_job_get(jobId: string) {
	try {
		return await window.electronAPI.installJobGet(jobId)
	} catch {
		return null
	}
}

export async function install_job_retry(jobId: string) {
	try {
		return await window.electronAPI.installJobRetry(jobId)
	} catch {
		return null
	}
}

export async function install_job_cancel(jobId: string) {
	try {
		return await window.electronAPI.installJobCancel(jobId)
	} catch {
		return null
	}
}

export async function install_job_dismiss(jobId: string) {
	try {
		return await window.electronAPI.installJobDismiss(jobId)
	} catch {
		return null
	}
}

export function installJobInstanceId(job: InstallJobSnapshot): string | null {
	return job.instance_id ?? job.target.instance_id ?? null
}

export function isInstallJobFinished(status: InstallJobStatus) {
	return (
		status === 'succeeded' ||
		status === 'failed' ||
		status === 'interrupted' ||
		status === 'canceled'
	)
}

function settleInstallJob(job: InstallJobSnapshot) {
	if (job.status === 'succeeded') return job

	throw new Error(job.error?.message ?? `Install job ${job.job_id} ${job.status}`)
}

export async function wait_for_install_job(jobId: string) {
	const current = await install_job_get(jobId)
	if (isInstallJobFinished(current.status)) return settleInstallJob(current)

	return await new Promise<InstallJobSnapshot>((resolve, reject) => {
		let finished = false
		let unlisten: (() => void) | null = null
		let pollInterval: ReturnType<typeof setInterval> | null = null

		const cleanup = () => {
			if (unlisten) {
				unlisten()
				unlisten = null
			}
			if (pollInterval) {
				clearInterval(pollInterval)
				pollInterval = null
			}
		}

		const resolveJob = (job: InstallJobSnapshot) => {
			if (finished || job.job_id !== jobId || !isInstallJobFinished(job.status)) return

			finished = true
			cleanup()

			try {
				resolve(settleInstallJob(job))
			} catch (err) {
				reject(err)
			}
		}

		const rejectWait = (err: unknown) => {
			if (finished) return
			finished = true
			cleanup()
			reject(err)
		}

		// Fallback polling for environments without event emission (Electron)
		pollInterval = setInterval(async () => {
			try {
				const job = await install_job_get(jobId)
				resolveJob(job)
			} catch (e) {
				rejectWait(e)
			}
		}, 1000)

		install_job_listener(resolveJob)
			.then((listener) => {
				if (finished) {
					listener()
					return
				}

				unlisten = listener
				install_job_get(jobId).then(resolveJob).catch(rejectWait)
			})
			.catch(rejectWait)
	})
}
