<script setup lang="ts">
import type { Labrinth, TagCategory } from '@emcl/api-client'
import { DownloadIcon, ExternalIcon, GlobeIcon } from '@emcl/assets'
import {
	Avatar,
	Badge,
	ButtonStyled,
	injectNotificationManager,
	ProjectHeader,
	ProjectPageDescription,
	ProjectSidebarCompatibility,
	ProjectSidebarLinks,
	ProjectSidebarTags,
	TagItem,
	useCompactNumber,
	useVIntl,
} from '@emcl/ui'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { get_project, get_project_versions, get_team } from '@/helpers/cache.js'
import { get_game_versions, get_loaders } from '@/helpers/tags.js'
import { openUrl } from '@/helpers/tauri-compat'
import { formatProjectType, releaseColor } from '@/helpers/utils'
import { injectContentInstall } from '@/providers/content-install'
import { useBreadcrumbs } from '@/store/breadcrumbs'

const { formatMessage, defineMessages } = useVIntl()
const { formatCompactNumber } = useCompactNumber()
const route = useRoute()
const breadcrumbs = useBreadcrumbs()
const { handleError } = injectNotificationManager()
const { install: installVersion } = injectContentInstall()

const messages = defineMessages({
	installButton: {
		id: 'project.actions.install',
		defaultMessage: 'Install',
	},
	openOnModrinth: {
		id: 'project.actions.open-on-modrinth',
		defaultMessage: 'Open on Modrinth',
	},
	noVersions: {
		id: 'project.versions.none',
		defaultMessage: 'No versions available yet.',
	},
	loading: {
		id: 'project.loading',
		defaultMessage: 'Loading...',
	},
	projectNotFound: {
		id: 'project.not-found',
		defaultMessage: 'Project not found',
	},
	team: {
		id: 'project.team.title',
		defaultMessage: 'Team',
	},
	latestVersion: {
		id: 'project.version.latest',
		defaultMessage: 'Latest version',
	},
})

const project = ref<any>(null)
const versions = ref<any[]>([])
const team = ref<any[]>([])
const tags = ref<any>({ gameVersions: [], loaders: [] })
const loading = ref(true)

breadcrumbs.setRootContext({ name: 'Project' })

onMounted(async () => {
	const slug = route.params.slug as string
	try {
		const [gv, ld] = await Promise.all([
			get_game_versions(),
			get_loaders(),
		])
		tags.value = {
			gameVersions: (gv ?? []).filter((x: any) => x.version),
			loaders: ld ?? [],
		}

		const result = await get_project(slug, 'must_revalidate')
		if (result) {
			project.value = result
			breadcrumbs.setRootContext({ name: result.title })
			const [versionData, teamData] = await Promise.all([
				get_project_versions(result.id),
				result.team ? get_team(result.team) : Promise.resolve([]),
			])
			versions.value = versionData ?? []
			team.value = teamData ?? []
		}
	} catch (e) {
		handleError(e)
	} finally {
		loading.value = false
	}
})

const latestVersion = computed(() => {
	if (versions.value.length === 0) return null
	return [...versions.value].sort(
		(a, b) => new Date(b.date_published).getTime() - new Date(a.date_published).getTime(),
	)[0]
})

async function handleInstall(versionId?: string) {
	if (!project.value) return
	await installVersion(project.value.id, versionId ?? latestVersion.value?.id, null, 'ProjectPage')
}

function openModrinth() {
	if (project.value?.slug) {
		openUrl(`https://modrinth.com/${project.value.project_type}/${project.value.slug}`)
	}
}
</script>

<template>
	<div v-if="loading" class="p-6 text-secondary">Loading...</div>
	<div v-else-if="!project" class="p-6 text-secondary">Project not found</div>
	<div v-else class="flex flex-col gap-6 p-6">
		<ProjectHeader :project="project">
			<template #actions>
				<ButtonStyled color="brand" size="large">
					<button @click="handleInstall()">
						<DownloadIcon /> Install
					</button>
				</ButtonStyled>
				<ButtonStyled color="secondary" size="large">
					<button @click="openModrinth">
						<GlobeIcon /> Open on Modrinth <ExternalIcon />
					</button>
				</ButtonStyled>
			</template>
		</ProjectHeader>

		<div class="flex gap-6">
			<section class="min-w-0 flex-1 flex flex-col gap-6">
				<section class="card flex-card flex flex-col gap-3">
					<h2 class="m-0 text-lg font-semibold text-contrast">Description</h2>
					<ProjectPageDescription :description="project.body ?? project.description" />
				</section>

				<div v-if="project.gallery?.length" class="flex gap-2 overflow-x-auto pb-2">
					<img
						v-for="(img, i) in project.gallery.filter((g: any) => g.url).slice(0, 8)"
						:key="i"
						:src="img.url"
						:alt="img.title ?? ''"
						class="h-40 rounded-xl object-cover flex-shrink-0"
					/>
				</div>

				<section class="card flex-card flex flex-col gap-3">
					<h2 class="m-0 text-lg font-semibold text-contrast">Versions</h2>
					<div v-if="versions.length === 0" class="text-secondary text-sm">No versions available</div>
					<div v-else class="flex flex-col gap-2">
						<div
							v-for="version in versions.slice(0, 50)"
							:key="version.id"
							class="flex items-center gap-3 p-3 rounded-xl bg-surface-4"
						>
							<div class="flex flex-col flex-1 min-w-0">
								<div class="flex items-center gap-2">
									<Badge :color="releaseColor(version.version_type)" :type="version.version_type" />
									<span class="font-semibold text-sm truncate">{{ version.version_number }}</span>
								</div>
								<div class="text-xs text-secondary truncate mt-1">
									{{ version.game_versions?.join(', ') ?? '' }}
									<span v-if="version.loaders?.length"> &middot; {{ version.loaders.join(', ') }}</span>
								</div>
							</div>
							<ButtonStyled circular color="brand" color-fill="none">
								<button @click="handleInstall(version.id)">
									<DownloadIcon />
								</button>
							</ButtonStyled>
						</div>
					</div>
				</section>
			</section>

			<aside class="w-80 flex-shrink-0 flex flex-col gap-4">
				<ProjectSidebarCompatibility
					:project="project"
					:tags="tags"
					class="card flex-card"
				/>
				<ProjectSidebarLinks
					:project="project"
					link-target="_blank"
					class="card flex-card"
				/>
				<ProjectSidebarTags
					:project="project"
					class="card flex-card"
				/>

				<div v-if="team.length > 0" class="card flex-card flex flex-col gap-3">
					<h2 class="m-0 text-lg font-semibold text-contrast">Team</h2>
					<div class="flex flex-col gap-2">
						<div v-for="member in team" :key="member.user?.id ?? member.user_id" class="flex items-center gap-2">
							<Avatar size="28px" :src="member.user?.avatar_url" />
							<div class="flex flex-col leading-tight">
								<span class="text-sm font-medium text-primary">{{ member.user?.username ?? 'Unknown' }}</span>
								<span v-if="member.role" class="text-xs text-secondary">{{ member.role }}</span>
							</div>
						</div>
					</div>
				</div>
			</aside>
		</div>
	</div>
</template>
