import cssContent from '@/assets/stylesheets/macFix.css?inline'

export async function useCheckDisableMouseover() {
	try {
		const os = window.electronAPI
			? (await window.electronAPI.utilsGetOs()).toLowerCase()
			: 'linux'

		if (os === 'macos') {
			const styleElement = document.createElement('style')
			styleElement.innerHTML = cssContent
			document.head.appendChild(styleElement)
		}
	} catch (error) {
		console.error('Error checking OS version', error)
	}
}
