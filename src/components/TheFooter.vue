<template>
    <div m-3>
        <n-button text text-lg mr-3 @click="toggleDark()">
            <div i-carbon-sun dark:i-carbon-moon />
        </n-button>
        <n-button text text-lg mr-3 @click="state.export()">
            <div i-carbon-download />
        </n-button>
        <n-button text text-lg @click="state.templateSetVisible = true; state.templateSetReopen = true">
            <div i-carbon-restart />
        </n-button>
    </div>
</template>

<script lang="ts" setup>
import { useState } from '~/store/state'

const state = useState()
</script>
