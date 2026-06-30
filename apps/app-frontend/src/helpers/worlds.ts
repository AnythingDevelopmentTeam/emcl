import type { GameVersion } from '@emcl/ui'
import { autoToHTML } from '@sfirew/minecraft-motd-parser'
import dayjs from 'dayjs'

import { get_full_path } from '@/helpers/instance'
import { openPath } from '@/helpers/utils'

type BaseWorld = {
	name: string
	last_played?: string
	icon?: string
	display_status: DisplayStatus
	type: WorldType
}

export type WorldType = 'singleplayer' | 'server'
export type DisplayStatus = 'normal' | 'hidden' | 'favorite'

export type SingleplayerWorld = BaseWorld & {
	type: 'singleplayer'
	path: string
	game_mode: SingleplayerGameMode
	hardcore: boolean
	locked: boolean
}

export type ServerWorld = BaseWorld & {
	type: 'server'
	index: number
	address: string
	pack_status: ServerPackStatus
	project_id?: string
	content_kind?: string
}

export type World = SingleplayerWorld | ServerWorld

export type WorldWithInstance = {
	instance_id: string
} & World

export type SingleplayerGameMode = 'survival' | 'creative' | 'adventure' | 'spectator'
export type ServerPackStatus = 'enabled' | 'disabled' | 'prompt'

export type ServerStatus = {
	description?: string | Chat
	players?: {
		max: number
		online: number
		sample: { name: string; id: string }[]
	}
	version?: {
		name: string
		protocol: number
		legacy: boolean
	}
	favicon?: string
	enforces_secure_chat: boolean
	ping?: number
}

export interface Chat {
	text: string
	bold: boolean
	italic: boolean
	underlined: boolean
	strikethrough: boolean
	obfuscated: boolean
	color?: string
	extra: Chat[]
}

export type ServerData = {
	refreshing: boolean
	lastSuccessfulRefresh?: number
	status?: ServerStatus
	rawMotd?: string | Chat
	renderedMotd?: string
}

export type ProtocolVersion = {
	version: number
	legacy: boolean
}

export async function get_recent_worlds(
	limit: number,
	displayStatuses?: DisplayStatus[],
): Promise<WorldWithInstance[]> {
	try {
		return await window.electronAPI.worldsGetRecent(limit, displayStatuses ?? [])
	} catch {
		return []
	}
}

export async function get_instance_worlds(instanceId: string): Promise<World[]> {
	try {
		return await window.electronAPI.worldsGetInstanceWorlds(instanceId)
	} catch {
		return []
	}
}

export async function get_singleplayer_world(
	instance: string,
	world: string,
): Promise<SingleplayerWorld> {
	throw new Error('get_singleplayer_world not implemented in Electron build')
}

export async function set_world_display_status(
	instance: string,
	worldType: WorldType,
	worldId: string,
	displayStatus: DisplayStatus,
): Promise<void> {
	try {
		return await window.electronAPI.worldsSetDisplayStatus(instance, worldType, worldId, displayStatus)
	} catch {
	}
}

export async function rename_world(
	instance: string,
	world: string,
	newName: string,
): Promise<void> {
	try {
		return await window.electronAPI.worldsRename(instance, world, newName)
	} catch {
	}
}

export async function reset_world_icon(instance: string, world: string): Promise<void> {
	throw new Error('reset_world_icon not implemented in Electron build')
}

export async function backup_world(instance: string, world: string): Promise<number> {
	try {
		return await window.electronAPI.worldsBackup(instance, world)
	} catch {
		return 0
	}
}

export async function delete_world(instance: string, world: string): Promise<void> {
	try {
		return await window.electronAPI.worldsDelete(instance, world)
	} catch {
	}
}

export async function add_server_to_instance(
	instanceId: string,
	name: string,
	address: string,
	packStatus: ServerPackStatus,
	projectId?: string,
	contentKind?: string,
): Promise<number> {
	throw new Error('add_server_to_instance not implemented in Electron build')
}

export async function edit_server_in_instance(
	instanceId: string,
	index: number,
	name: string,
	address: string,
	packStatus: ServerPackStatus,
): Promise<void> {
	throw new Error('edit_server_in_instance not implemented in Electron build')
}

export async function remove_server_from_instance(
	instanceId: string,
	index: number,
): Promise<void> {
	throw new Error('remove_server_from_instance not implemented in Electron build')
}

export async function get_instance_protocol_version(
	instanceId: string,
): Promise<ProtocolVersion | null> {
	throw new Error('get_instance_protocol_version not implemented in Electron build')
}

export async function get_server_status(
	address: string,
	protocolVersion: ProtocolVersion | null = null,
): Promise<ServerStatus> {
	throw new Error('get_server_status not implemented in Electron build')
}

export async function start_join_singleplayer_world(
	instanceId: string,
	world: string,
): Promise<unknown> {
	throw new Error('start_join_singleplayer_world not implemented in Electron build')
}

export async function start_join_server(instanceId: string, address: string): Promise<unknown> {
	throw new Error('start_join_server not implemented in Electron build')
}

export async function showWorldInFolder(instanceId: string, worldPath: string) {
	const fullPath = await get_full_path(instanceId)
	return await openPath(fullPath + '/saves/' + worldPath)
}

export function getWorldIdentifier(world: World) {
	return world.type === 'singleplayer' ? world.path : world.address
}

export function sortWorlds(worlds: World[]) {
	worlds.sort((a, b) => {
		if (!a.last_played) {
			return 1
		}
		if (!b.last_played) {
			return -1
		}
		return dayjs(b.last_played).diff(dayjs(a.last_played))
	})
}

export function isSingleplayerWorld(world: World): world is SingleplayerWorld {
	return world.type === 'singleplayer'
}

export function isServerWorld(world: World): world is ServerWorld {
	return world.type === 'server'
}

const DEFAULT_MINECRAFT_SERVER_PORT = 25565

function parseServerPort(port: string): number | null {
	const parsed = Number.parseInt(port, 10)
	return Number.isInteger(parsed) && parsed > 0 && parsed <= 65535 ? parsed : null
}

function parseServerHost(address: string): string {
	const trimmedAddress = address.trim()
	if (!trimmedAddress) return ''

	if (trimmedAddress.startsWith('[')) {
		const closingBracket = trimmedAddress.indexOf(']')
		if (closingBracket > 0) {
			return trimmedAddress.slice(1, closingBracket).trim().toLowerCase()
		}
	}

	const firstColon = trimmedAddress.indexOf(':')
	const lastColon = trimmedAddress.lastIndexOf(':')

	if (firstColon !== -1 && firstColon === lastColon) {
		return trimmedAddress.slice(0, firstColon).trim().toLowerCase()
	}

	return trimmedAddress.toLowerCase()
}

function isIPv4Host(host: string): boolean {
	const segments = host.split('.')
	if (segments.length !== 4) return false

	return segments.every((segment) => {
		if (!/^\d+$/.test(segment)) return false
		const value = Number.parseInt(segment, 10)
		return value >= 0 && value <= 255
	})
}

export function normalizeServerAddress(address: string): string {
	const trimmedAddress = address.trim()
	const host = parseServerHost(trimmedAddress)
	if (!host) return ''
	let port = DEFAULT_MINECRAFT_SERVER_PORT

	if (trimmedAddress.startsWith('[')) {
		const closingBracket = trimmedAddress.indexOf(']')
		if (closingBracket > 0) {
			const suffix = trimmedAddress.slice(closingBracket + 1)
			if (suffix.startsWith(':')) {
				const parsedPort = parseServerPort(suffix.slice(1))
				if (parsedPort != null) {
					port = parsedPort
				}
			}
		}
	} else {
		const firstColon = trimmedAddress.indexOf(':')
		const lastColon = trimmedAddress.lastIndexOf(':')
		if (firstColon !== -1 && firstColon === lastColon) {
			const parsedPort = parseServerPort(trimmedAddress.slice(firstColon + 1))
			if (parsedPort != null) {
				port = parsedPort
			}
		}
	}

	return `${host}:${port}`
}

export function getServerDomainKey(address: string): string {
	const normalizedAddress = normalizeServerAddress(address)
	if (!normalizedAddress) return ''

	const separator = normalizedAddress.lastIndexOf(':')
	if (separator <= 0 || separator === normalizedAddress.length - 1) return normalizedAddress

	const host = normalizedAddress.slice(0, separator).replace(/\.+$/, '')
	if (!host) return normalizedAddress
	if (host.includes(':') || isIPv4Host(host)) return normalizedAddress

	const segments = host.split('.').filter(Boolean)
	if (segments.length <= 2) return host

	return segments.slice(1).join('.')
}

export function resolveManagedServerWorld(
	worlds: World[],
	managedName: string | null | undefined,
	managedAddress: string | null | undefined,
): ServerWorld | null {
	if (!managedName || !managedAddress) return null

	const normalizedManagedAddress = normalizeServerAddress(managedAddress)
	if (!normalizedManagedAddress) return null

	const servers = worlds
		.filter(isServerWorld)
		.slice()
		.sort((a, b) => a.index - b.index)

	const exactMatch = servers.find(
		(server) =>
			server.name === managedName &&
			normalizeServerAddress(server.address) === normalizedManagedAddress,
	)
	if (exactMatch) return exactMatch

	return (
		servers.find((server) => normalizeServerAddress(server.address) === normalizedManagedAddress) ??
		null
	)
}

export function getServerAddress(javaServer?: { address?: string | null } | null) {
	if (!javaServer) return null
	return javaServer.address ?? null
}

export async function ensureManagedServerWorldExists(
	instanceId: string,
	serverName: string,
	serverAddress: string | null,
) {
	if (!instanceId || !serverAddress) return
	try {
		const worlds = await get_instance_worlds(instanceId)
		const managedWorld = resolveManagedServerWorld(worlds, serverName, serverAddress)
		if (!managedWorld) {
			// add_server_to_instance not implemented
			console.warn('add_server_to_instance not implemented in Electron build')
		}
	} catch (err) {
		console.error('Failed to ensure managed server world exists:', err)
	}
}

export async function getServerLatency(
	address: string,
	protocolVersion: ProtocolVersion | null = null,
): Promise<number | undefined> {
	const pings: number[] = []
	for (let i = 0; i < 3; i++) {
		try {
			const status = await get_server_status(address, protocolVersion)
			if (status.ping != null) {
				pings.push(status.ping)
			}
		} catch {
			// Ignore individual ping failures
		}
	}
	if (pings.length === 0) return undefined
	return Math.round(pings.reduce((sum, p) => sum + p, 0) / pings.length)
}

export async function refreshServerData(
	serverData: ServerData,
	protocolVersion: ProtocolVersion | null,
	address: string,
): Promise<void> {
	const refreshTime = Date.now()
	serverData.refreshing = true
	try {
		const status = await get_server_status(address, protocolVersion)
		if (serverData.lastSuccessfulRefresh && serverData.lastSuccessfulRefresh > refreshTime) {
			return
		}
		serverData.lastSuccessfulRefresh = Date.now()
		serverData.status = status
		if (status.description) {
			serverData.rawMotd = status.description
			serverData.renderedMotd = autoToHTML(status.description)
		} else {
			delete serverData.rawMotd
			delete serverData.renderedMotd
		}
	} catch (err) {
		console.error(`Refreshing addr ${address}`, protocolVersion, err)
		if (!protocolVersion?.legacy) {
			await refreshServerData(serverData, { version: 74, legacy: true }, address)
			return
		}
		if (!serverData.lastSuccessfulRefresh || serverData.lastSuccessfulRefresh <= refreshTime) {
			delete serverData.status
			delete serverData.rawMotd
			delete serverData.renderedMotd
		}
	} finally {
		serverData.refreshing = false
	}
}

export function refreshServers(
	worlds: World[],
	serverData: Record<string, ServerData>,
	protocolVersion: ProtocolVersion | null,
) {
	const servers = worlds.filter(isServerWorld)
	servers.forEach((server) => {
		if (!serverData[server.address]) {
			serverData[server.address] = {
				refreshing: true,
			}
		} else {
			serverData[server.address].refreshing = true
		}
	})

	Object.keys(serverData).forEach((address) =>
		refreshServerData(serverData[address], protocolVersion, address),
	)
}

export async function refreshWorld(worlds: World[], instanceId: string, worldPath: string) {
	const index = worlds.findIndex((w) => w.type === 'singleplayer' && w.path === worldPath)
	try {
		const newWorld = await get_singleplayer_world(instanceId, worldPath)
		if (index !== -1) {
			worlds[index] = newWorld
		} else {
			console.info(`Adding new world at path: ${worldPath}.`)
			worlds.push(newWorld)
		}
	} catch (e) {
		console.warn('refreshWorld not fully implemented in Electron build', e)
	}
	sortWorlds(worlds)
}

export async function handleDefaultInstanceUpdateEvent(
	worlds: World[],
	instanceId: string,
	e: InstanceEvent,
) {
	if (e.event === 'world_updated') {
		await refreshWorld(worlds, instanceId, e.world)
	}

	if (e.event === 'server_joined') {
		const world = worlds.find(
			(w) =>
				w.type === 'server' &&
				(w.address === `${e.host}:${e.port}` || (e.port == 25565 && w.address == e.host)),
		)
		if (world) {
			world.last_played = e.timestamp
			sortWorlds(worlds)
		} else {
			console.error(`Could not find world for server join event: ${e.host}:${e.port}`)
		}
	}
}

export async function refreshWorlds(instanceId: string): Promise<World[]> {
	const worlds = await get_instance_worlds(instanceId).catch((err) => {
		console.error(`Error refreshing worlds for instance: ${instanceId}`, err)
	})
	if (worlds) {
		sortWorlds(worlds)
	}

	return worlds ?? []
}

export function hasServerQuickPlaySupport(gameVersions: GameVersion[], currentVersion: string) {
	if (!gameVersions.length) {
		return true
	}

	const versionIndex = gameVersions.findIndex((v) => v.version === currentVersion)
	const targetIndex = gameVersions.findIndex((v) => v.version === 'a1.0.5_01')

	return versionIndex === -1 || targetIndex === -1 || versionIndex <= targetIndex
}

export function hasWorldQuickPlaySupport(gameVersions: GameVersion[], currentVersion: string) {
	if (!gameVersions.length) {
		return false
	}

	const versionIndex = gameVersions.findIndex((v) => v.version === currentVersion)
	const targetIndex = gameVersions.findIndex((v) => v.version === '23w14a')

	return versionIndex !== -1 && targetIndex !== -1 && versionIndex <= targetIndex
}

export type InstanceEvent = { instance_id: string } & (
	| {
			event: 'servers_updated'
	  }
	| {
			event: 'world_updated'
			world: string
	  }
	| {
			event: 'server_joined'
			host: string
			port: number
			timestamp: string
	  }
)
