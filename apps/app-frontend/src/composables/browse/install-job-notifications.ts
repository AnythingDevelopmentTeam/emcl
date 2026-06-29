import { ref } from 'vue'

export function useInstallJobNotifications() {
	return {
		notificationCount: ref(0),
		installJobs: ref([]),
	}
}
