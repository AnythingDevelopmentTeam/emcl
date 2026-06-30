import type { CrowdinMessages } from '@emcl/ui'

export const moderationLocaleModules = import.meta.glob<{ default: CrowdinMessages }>(
	'./locales/*/index.json',
	{ eager: false },
)
