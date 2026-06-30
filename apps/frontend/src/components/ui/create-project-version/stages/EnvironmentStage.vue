<template>
	<EnvironmentSelector v-model="draftVersion.environment" />
</template>

<script lang="ts" setup>
import { EnvironmentSelector } from '@emcl/ui'

import { injectManageVersionContext } from '~/providers/version/manage-version-modal'

const { draftVersion } = injectManageVersionContext()
</script>
