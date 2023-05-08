<template>
    <div
        m-2
        mr-1
        pt-1
        rounded-2
        bg-white
        dark:bg-gray-800
        flex-col
        flex
        w-full>
        <div flex-1>
            <div v-if="!state.templateSetVisible && !state.templateChooseVisible">
                <n-scrollbar max-h-80vh>
                    <n-tree
                        block-line
                        expand-on-click
                        text-left
                        :data="data"
                        :node-props="nodeProps"
                        :on-update:expanded-keys="updatePrefixWithExpaned" />
                </n-scrollbar>
            </div>
            <div v-else text-left pl-3>
                <n-skeleton text class="w-50%" />
                <n-skeleton text class="w-50% ml-7" />
                <n-skeleton text class="w-60% ml-14" />
                <n-skeleton text class="w-70% ml-7" />
                <n-skeleton text class="w-40% ml-14" />
                <n-skeleton text class="w-40% ml-21" />
                <n-skeleton text class="w-40%" />
                <n-skeleton text class="w-50% ml-7" />
                <n-skeleton text class="w-40% ml-14" />
                <n-skeleton text class="w-40% ml-21" />
            </div>
        </div>
        <TheFooter />
    </div>
</template>

<script lang="ts" setup>
import { h } from 'vue'
import type { TreeOption } from 'naive-ui'
import { NIcon } from 'naive-ui'
import {
    DocumentText,
    Folder,
    FolderOpenOutline
} from '@vicons/ionicons5'
import { useState } from '~/store/state'

const state = useState()

function updatePrefixWithExpaned(_keys: Array<string | number>,
    _option: Array<TreeOption | null>,
    meta: {
        node: TreeOption | null
        action: 'expand' | 'collapse' | 'filter'
    }) {
    if (!meta.node)
        return
    if (meta.action === 'expand') {
        meta.node.prefix = () =>
            h(NIcon, null, {
                default: () => h(FolderOpenOutline)
            })
    }
    else if (meta.action === 'collapse') {
        meta.node.prefix = () =>
            h(NIcon, null, {
                default: () => h(Folder)
            })
    }
}
function nodeProps({ option }: { option: TreeOption }) {
    return {
        onClick() {
            if (!option.children && !option.disabled)
                state.templateSelected = option.key?.toString()
        }
    }
}

const data = computed(() => {
    return dfs(state.fileStructure, '')
})

function dfs(obj: any, path: string) {
    const res = []
    for (const key in obj) {
        const item: any = {
            key: `${path}/${key}`,
            label: key
        }
        if (typeof obj[key] === 'object') {
            item.prefix = () => h(
                NIcon, null, {
                    default: () => h(Folder)
                }
            )
            item.children = dfs(obj[key], `${path}/${key}`)
        }
        else {
            item.prefix = () => h(
                NIcon, null, {
                    default: () => h(DocumentText)
                }
            )
        }
        res.push(item)
    }
    return res
}
</script>
