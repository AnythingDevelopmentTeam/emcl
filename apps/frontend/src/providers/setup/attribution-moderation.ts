import { attributionQuickReplies } from '@emcl/moderation'
import { provideAttributionModeration } from '@emcl/ui'

export function setupAttributionModerationProvider() {
	provideAttributionModeration({ attributionQuickReplies })
}
