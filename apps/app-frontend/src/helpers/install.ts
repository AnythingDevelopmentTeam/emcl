import { install_job_listener } from './events'
import type { InstanceLink, InstanceLoader } from './types'
import { invoke } from './tauri-compat'

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
	throw new Error('install_get_modpack_preview not implemented in Electron build')
}

export async function install_create_instance(request: InstallCreateInstanceRequest) {
	try {
		return await window.electronAPI.installCreateInstance(
			request.name,
			request.gameVersion,
			request.loader,
			request.loaderVersion ?? null,
			request.iconPath ?? null,
			request.link ? JSON.stringify(request.link) : null,
		)
	} catch {
		return null
	}
}

export async function install_create_modpack_instance(
	location: CreatePackLocation,
	postInstallEdit?: InstallPostInstallEdit | null,
) {
	throw new Error('install_create_modpack_instance not implemented in Electron build')
}

export async function install_import_instance(
	launcherType: string,
	basePath: string,
	instanceFolder: string,
) {
	throw new Error('install_import_instance not implemented in Electron build')
}

export async function install_duplicate_instance(sourceInstanceId: string) {
	throw new Error('install_duplicate_instance not implemented in Electron build')
}

export async function install_existing_instance(instanceId: string, force: boolean) {
	throw new Error('install_existing_instance not implemented in Electron build')
}

export async function install_pack_to_existing_instance(
	instanceId: string,
	location: CreatePackLocation,
	postInstallEdit?: InstallPostInstallEdit | null,
) {
	throw new Error('install_pack_to_existing_instance not implemented in Electron build')
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

		const cleanup = () => {
			if (unlisten) {
				unlisten()
				unlisten = null
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
