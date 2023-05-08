<template>
    <n-config-provider
        :theme="theme"
        font-sans
        text="center gray-700 dark:gray-200"
        h-full>
        <n-loading-bar-provider>
            <n-message-provider>
                <RouterView />
            </n-message-provider>
        </n-loading-bar-provider>
    </n-config-provider>
</template>

<script lang="ts" setup>
import { darkTheme } from 'naive-ui'

const theme = computed(() => (isDark.value ? darkTheme : null))
</script>
