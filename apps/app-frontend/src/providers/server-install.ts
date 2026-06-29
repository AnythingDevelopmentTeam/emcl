import type { Ref } from 'vue'
import { ref } from 'vue'

export function createServerInstall() {
	return {
		setInstallToPlayModal: () => {},
		setUpdateToPlayModal: () => {},
		setAddServerToInstanceModal: () => {},
		playServerProject: async () => {},
	}
}

export function provideServerInstall() {}

export function injectServerInstall() {
	return {
		setInstallToPlayModal: () => {},
		setUpdateToPlayModal: () => {},
		setAddServerToInstanceModal: () => {},
		playServerProject: async () => {},
	}
}
