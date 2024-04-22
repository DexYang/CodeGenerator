<script lang="ts" setup>
import { Codemirror } from 'vue-codemirror'
import { java } from '@codemirror/lang-java'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { useState } from '~/store/state'

interface FileStructure {
    [key: string]: FileStructure | string
}

const state = useState()

const path = computed(() => {
    if (state.templateSelected && state.templateSelected !== '') {
        const _path = state.templateSelected.split('/').filter(item => item !== '')
        return _path
    }
    return []
})

const parentNode = computed(() => {
    let item = state.fileStructure
    const _path = path.value.slice(0, path.value.length - 1)
    for (const p in _path)
        item = item[_path[p]] as FileStructure
    return item
})

const code = computed({
    get: () => {
        if (path.value.length > 0 && parentNode.value[path.value[path.value.length - 1]])
            return parentNode.value[path.value[path.value.length - 1]].toString()
        return ''
    },
    set: (val) => {
        if (path.value.length > 0 && parentNode.value[path.value[path.value.length - 1]])
            parentNode.value[path.value[path.value.length - 1]] = val
    }
})

const extensions = computed(() => {
    const res = [java(), javascript(), oneDark]
    return isDark.value ? res : res.slice(0, 2)
})
</script>

<template>
    <div class="m-2 ml-1 w-full rounded-2 bg-white p-2 text-left dark:bg-gray-800">
        <div v-if="(!state.templateSetVisible && !state.templateChooseVisible) || state.templateSetReopen" h-full>
            <Codemirror
                v-model="code"
                placeholder="Code goes here..."
                :style="{ height: '100%' }"
                :autofocus="true"
                :indent-with-tab="true"
                :tab-size="4"
                :extensions="extensions" />
        </div>
        <div v-else pl-3 text-left>
            <n-skeleton text class="w-50%" />
            <n-skeleton text class="ml-7 w-50%" />
            <n-skeleton text class="ml-14 w-60%" />
            <n-skeleton text class="ml-7 w-70%" />
            <n-skeleton text class="ml-14 w-60%" />
            <n-skeleton text class="ml-21 w-60%" />
            <n-skeleton text class="w-90%" />
            <n-skeleton text class="ml-7 w-50%" />
            <n-skeleton text class="ml-14 w-80%" />
            <n-skeleton text class="ml-21 w-70%" />
        </div>
    </div>
</template>
