<script setup lang="ts">
import {
	CoffeeIcon,
	GameIcon,
	GaugeIcon,
	LanguagesIcon,
	PaintbrushIcon,
	SettingsIcon,
	ShieldIcon,
	ToggleRightIcon,
} from '@emcl/assets'
import {
	commonMessages,
	commonSettingsMessages,
	defineMessage,
	defineMessages,
	ProgressBar,
	TabbedModal,
	useVIntl,
} from '@emcl/ui'
import { ref, watch } from 'vue'

import AppearanceSettings from '@/components/ui/settings/AppearanceSettings.vue'
import DefaultInstanceSettings from '@/components/ui/settings/DefaultInstanceSettings.vue'
import FeatureFlagSettings from '@/components/ui/settings/FeatureFlagSettings.vue'
import JavaSettings from '@/components/ui/settings/JavaSettings.vue'
import LanguageSettings from '@/components/ui/settings/LanguageSettings.vue'
import PrivacySettings from '@/components/ui/settings/PrivacySettings.vue'
import ResourceManagementSettings from '@/components/ui/settings/ResourceManagementSettings.vue'
import type { AppSettings } from '@/helpers/settings.ts'
import { get, set } from '@/helpers/settings.ts'
import { getVersion, platform as getOsPlatform } from '@/helpers/tauri-compat'
import { injectAppUpdateDownloadProgress } from '@/providers/download-progress.ts'
import { useTheming } from '@/store/state'

const themeStore = useTheming()

const { formatMessage } = useVIntl()

const devModeCounter = ref(0)

const developerModeEnabled = defineMessage({
	id: 'app.settings.developer-mode-enabled',
	defaultMessage: 'Developer mode enabled.',
})

const tabs = [
	{
		name: defineMessage({
			id: 'app.settings.tabs.appearance',
			defaultMessage: 'Appearance',
		}),
		icon: PaintbrushIcon,
		content: AppearanceSettings,
	},
	{
		name: defineMessage({
			id: 'app.settings.tabs.language',
			defaultMessage: 'Language',
		}),
		icon: LanguagesIcon,
		content: LanguageSettings,
		badge: commonMessages.beta,
	},
	{
		name: defineMessage({
			id: 'app.settings.tabs.privacy',
			defaultMessage: 'Privacy',
		}),
		icon: ShieldIcon,
		content: PrivacySettings,
	},
	{
		name: defineMessage({
			id: 'app.settings.tabs.java-installations',
			defaultMessage: 'Java installations',
		}),
		icon: CoffeeIcon,
		content: JavaSettings,
	},
	{
		name: defineMessage({
			id: 'app.settings.tabs.default-instance-options',
			defaultMessage: 'Default instance options',
		}),
		icon: GameIcon,
		content: DefaultInstanceSettings,
	},
	{
		name: defineMessage({
			id: 'app.settings.tabs.resource-management',
			defaultMessage: 'Resource management',
		}),
		icon: GaugeIcon,
		content: ResourceManagementSettings,
	},
	{
		name: commonSettingsMessages.featureFlags,
		icon: ToggleRightIcon,
		content: FeatureFlagSettings,
		developerOnly: true,
	},
]

const modal = ref<InstanceType<typeof TabbedModal> | null>(null)

function show() {
	modal.value?.show()
}

defineExpose({ show })

const { progress, version: downloadingVersion } = injectAppUpdateDownloadProgress()

const version = await getVersion()
const osPlatform = await getOsPlatform()
const osVersion = ''
const loaded = await get()
const settings = ref(loaded ?? ({} as AppSettings))

watch(
	settings,
	async () => {
		await set(settings.value)
	},
	{ deep: true },
)

function devModeCount() {
	devModeCounter.value++
	if (devModeCounter.value > 5) {
		themeStore.devMode = !themeStore.devMode
		settings.value.developer_mode = !!themeStore.devMode
		devModeCounter.value = 0

		if (!themeStore.devMode && tabs[modal.value!.selectedTab].developerOnly) {
			modal.value!.setTab(0)
		}
	}
}

const messages = defineMessages({
	downloading: {
		id: 'app.settings.downloading',
		defaultMessage: 'Downloading v{version}',
	},
})
</script>
<template>
	<TabbedModal ref="modal" :tabs="tabs.filter((t) => !t.developerOnly || themeStore.devMode)">
		<template #title>
			<span class="flex items-center gap-2 text-lg font-extrabold text-contrast">
				<SettingsIcon /> Settings
			</span>
		</template>
		<template #footer>
			<div class="mt-auto text-secondary text-sm">
				<div class="mb-3">
					<template v-if="progress > 0 && progress < 1">
						<p class="m-0 mb-2">
							{{ formatMessage(messages.downloading, { version: downloadingVersion }) }}
						</p>
						<ProgressBar :progress="progress" />
					</template>
				</div>
				<p v-if="themeStore.devMode" class="text-brand font-semibold m-0 mb-2">
					{{ formatMessage(developerModeEnabled) }}
				</p>
				<div class="flex items-center gap-3">
					<div class="max-w-[200px]">
						<button
							class="p-0 m-0 bg-transparent border-none cursor-pointer"
							@click="devModeCount"
						>
							<p class="m-0 text-secondary">EMCL {{ version }}</p>
						</button>
						<p class="m-0 text-secondary">
							<span v-if="osPlatform === 'macos'">macOS</span>
							<span v-else class="capitalize">{{ osPlatform }}</span>
							{{ osVersion }}
						</p>
					</div>
				</div>
			</div>
		</template>
	</TabbedModal>
</template>
