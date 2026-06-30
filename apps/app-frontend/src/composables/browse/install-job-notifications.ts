import { computed, ref } from 'vue'

export function useInstallJobNotifications() {
	const installJobs = ref<any[]>([])
	const active = computed(() => installJobs.value.length > 0)
	const title = ref('')
	const notificationCount = ref(0)
	const buttons = ref<any[]>([])
	const progressItems = computed(() => [])

	return {
		active,
		title,
		notificationCount,
		buttons,
		progressItems,
		installJobs,
		dispose: () => {},
	}
}
