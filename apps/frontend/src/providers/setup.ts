import { provideNotificationManager } from '@emcl/ui'

import { FrontendNotificationManager } from './frontend-notifications'
import { setupAuthProvider } from './setup/auth'
import { setupFilePickerProvider } from './setup/file-picker'
import { setupLoadingStateProvider } from './setup/loading-state'
import { setupClientProvider } from './setup/modrinth-client'
import { setupPageContextProvider } from './setup/page-context'
import { setupTagsProvider } from './setup/tags'

export function setupProviders(auth: Awaited<ReturnType<typeof useAuth>>) {
	provideNotificationManager(new FrontendNotificationManager())

	setupAuthProvider(auth)
	setupClientProvider(auth)
	setupTagsProvider()
	setupFilePickerProvider()
	setupPageContextProvider()
	setupLoadingStateProvider()
}
