<template>
    <div class="w-full bg-white p-2 dark:bg-gray-800 m-2 ml-1 rounded-2 text-left">
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
        <div v-else text-left pl-3>
            <n-skeleton text class="w-50%" />
            <n-skeleton text class="w-50% ml-7" />
            <n-skeleton text class="w-60% ml-14" />
            <n-skeleton text class="w-70% ml-7" />
            <n-skeleton text class="w-60% ml-14" />
            <n-skeleton text class="w-60% ml-21" />
            <n-skeleton text class="w-90%" />
            <n-skeleton text class="w-50% ml-7" />
            <n-skeleton text class="w-80% ml-14" />
            <n-skeleton text class="w-70% ml-21" />
        </div>
    </div>
</template>

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
