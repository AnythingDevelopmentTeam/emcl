<script setup lang="ts">
import type { Labrinth } from '@emcl/api-client'
import { DownloadIcon, SearchIcon } from '@emcl/assets'
import type { CardAction } from '@emcl/ui'
import {
	BrowsePageLayout,
	BrowseSidebar,
	defineMessages,
	injectNotificationManager,
	provideBrowseManager,
	useBrowseSearch,
	useVIntl,
} from '@emcl/ui'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { get_search_results } from '@/helpers/cache.js'
import { get_categories, get_game_versions, get_loaders } from '@/helpers/tags.js'
import { injectContentInstall } from '@/providers/content-install'
import { useBreadcrumbs } from '@/store/breadcrumbs'

const { formatMessage } = useVIntl()
const route = useRoute()
const breadcrumbs = useBreadcrumbs()
const { handleError } = injectNotificationManager()
const { install: installVersion } = injectContentInstall()

const messages = defineMessages({
	installButton: {
		id: 'browse.actions.install',
		defaultMessage: 'Install',
	},
	installingLabel: {
		id: 'browse.actions.installing',
		defaultMessage: 'Installing...',
	},
})

const projectType = computed(() => (route.params.type as string) ?? 'mod')
const typeNames: Record<string, string> = {
	mod: 'Browse Mods',
	modpack: 'Browse Modpacks',
	resourcepack: 'Browse Resource Packs',
	shader: 'Browse Shaders',
	datapack: 'Browse Data Packs',
	plugin: 'Browse Plugins',
	server: 'Browse Servers',
}

breadcrumbs.setRootContext({ name: typeNames[projectType.value] ?? 'Browse' })

const tags = ref<{
	gameVersions: Labrinth.Tags.v2.GameVersion[]
	loaders: Labrinth.Tags.v2.Loader[]
	categories: Labrinth.Tags.v2.Category[]
}>({ gameVersions: [], loaders: [], categories: [] })

onMounted(async () => {
	try {
		const [categories, gameVersions, loaders] = await Promise.all([
			get_categories(),
			get_game_versions(),
			get_loaders(),
		])
		tags.value = {
			categories: categories ?? [],
			gameVersions: (gameVersions ?? []).filter((x: any) => x.version),
			loaders: loaders ?? [],
		}
	} catch (e) {
		handleError(e)
	}
})

async function search(requestParams: string) {
	const response = await get_search_results(requestParams)
	const result = response?.result
	return {
		projectHits: (result?.hits ?? []).map((h: any) => ({
			...h,
			installed: false,
			installing: false,
		})),
		serverHits: [],
		total_hits: result?.total_hits ?? 0,
		per_page: result?.limit ?? 20,
	}
}

const searchState = useBrowseSearch({
	projectType,
	tags,
	search,
	persistentQueryParams: ['i'],
})

searchState.refreshSearch()

const instanceId = computed(() => route.query.i as string | undefined)
const installingProjects = ref<Set<string>>(new Set())
const filtersMenuOpen = ref(false)

function getCardActions(
	result: Labrinth.Search.v2.ResultSearchProject,
): CardAction[] {
	if (!instanceId.value) return []
	const isInstalling = installingProjects.value.has(result.project_id)
	return [
		{
			key: 'install',
			label: isInstalling ? formatMessage(messages.installingLabel) : formatMessage(messages.installButton),
			icon: isInstalling ? SearchIcon : DownloadIcon,
			iconClass: isInstalling ? 'animate-spin' : undefined,
			disabled: isInstalling,
			color: 'brand',
			type: 'outlined',
			onClick: async () => {
				if (isInstalling || !instanceId.value) return
				installingProjects.value = new Set([...installingProjects.value, result.project_id])
				try {
					await installVersion(result.project_id, null, instanceId.value, 'browse')
				} catch (e) {
					handleError(e)
				} finally {
					const next = new Set(installingProjects.value)
					next.delete(result.project_id)
					installingProjects.value = next
				}
			},
		},
	]
}

function getProjectLink(result: Labrinth.Search.v2.ResultSearchProject) {
	if (instanceId.value) {
		return { path: `/project/${result.slug ?? result.project_id}`, query: { i: instanceId.value } }
	}
	return `/project/${result.slug ?? result.project_id}`
}

provideBrowseManager({
	tags,
	projectType,
	...searchState,
	getProjectLink,
	getServerProjectLink: () => '#',
	getCardActions,
	selectableProjectTypes: computed(() => []),
	showProjectTypeTabs: computed(() => false),
	variant: 'app',
	filtersMenuOpen,
})
</script>

<template>
	<div class="flex gap-6 p-6">
		<section class="min-w-0 flex-1">
			<BrowsePageLayout />
		</section>
		<aside class="w-80 flex-shrink-0">
			<BrowseSidebar />
		</aside>
	</div>
</template>
