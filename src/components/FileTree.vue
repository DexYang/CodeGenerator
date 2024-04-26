<script lang="ts" setup>
import { h } from 'vue'
import type { TreeDropInfo, TreeOption } from 'naive-ui'
import { NIcon, useMessage } from 'naive-ui'
import {
    DocumentText,
    Folder,
    FolderOpenOutline
} from '@vicons/ionicons5'
import { useState } from '~/store/state'

const state = useState()
const message = useMessage()

const inputPopoverShow = ref(false)
const inputPopoverX = ref(0)
const inputPopoverY = ref(0)
const inputPopoverValue = ref('')
const inputPopoverKey = ref('')
const expandAll = ref(true)

function updatePrefixWithExpanded(_keys: Array<string | number>, _option: Array<TreeOption | null>, meta: {
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
    } else if (meta.action === 'collapse') {
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
        },
        onContextmenu(e: MouseEvent): void {
            inputPopoverKey.value = option.key ? option.key.toString() : ''
            inputPopoverShow.value = true
            inputPopoverX.value = e.clientX
            inputPopoverY.value = e.clientY
            e.preventDefault()
            e.stopPropagation()
        }
    }
}

function changeFileName() {
    if (inputPopoverValue.value === '') {
        message.error('请填写文件名')
        return
    }
    const { parent, key }: { parent: Record<any, any>, key: string } = locate(inputPopoverKey.value)
    if (inputPopoverValue.value in parent) {
        message.error('文件名重复')
        return
    }
    parent[inputPopoverValue.value] = parent[key]
    delete parent[key]
    inputPopoverValue.value = ''
    inputPopoverShow.value = false
}

function deleteFile() {
    const { parent, key }: { parent: Record<any, any>, key: string } = locate(inputPopoverKey.value)
    delete parent[key]
    inputPopoverValue.value = ''
    inputPopoverShow.value = false
    react()
}

interface FileStructure {
    [key: string]: FileStructure | string
}

function locate(treeKey: string): { parent: Record<any, any>, key: string } {
    const path = treeKey.split('/').filter(item => item !== '')
    let loc = state.fileStructure
    let parent = loc
    let key = ''
    for (let j = 0; j < path.length; j++) {
        parent = loc
        key = path[j]
        loc = loc[path[j]] as FileStructure
    }
    return { parent, key }
}

const data = computed(() => {
    return dfs(state.fileStructure, '')
})

function dfs(obj: any, path: string) {
    const res = []
    for (const key in obj) {
        if (key.startsWith('ignore'))
            continue
        const item: any = {
            key: `${path}/${key}`,
            label: key
        }
        if (typeof obj[key] === 'object') {
            item.prefix = () => h(
                NIcon,
                null,
                {
                    default: () => h(Folder)
                }
            )
            item.children = dfs(obj[key], `${path}/${key}`)
        } else {
            item.prefix = () => h(
                NIcon,
                null,
                {
                    default: () => h(DocumentText)
                }
            )
        }
        res.push(item)
    }
    return res
}

function react() {
    expandAll.value = false
    nextTick(() => {
        expandAll.value = true
    })
}

function handleDrop({ node, dragNode, dropPosition }: TreeDropInfo) {
    if (dropPosition === 'inside') {
        const { parent: targetParent, key: targetParentKey } = locate(node.key ? node.key.toString() : '')
        const { parent, key } = locate(dragNode.key ? dragNode.key.toString() : '')
        const targetNode = parent[key]
        if (key in targetParent[targetParentKey]) {
            message.error('该目录下已有同名文件或文件夹，移动失败')
            return
        }
        targetParent[targetParentKey][key] = targetNode
        delete parent[key]
    }
}

const createPopoverShow = ref(false)
const createPopoverX = ref(0)
const createPopoverY = ref(0)
function showContextMenu(e: MouseEvent) {
    createPopoverShow.value = true
    createPopoverX.value = e.clientX
    createPopoverY.value = e.clientY
    e.preventDefault()
}

function createFileOrFolder(type: 0 | 1) {
    const key = type === 0 ? 'new folder' : 'new file'
    if (key in state.fileStructure) {
        message.error(`根目录下已有同名文件${type === 0 ? '夹' : ''}，无法创建`)
        return
    }
    state.fileStructure[key] = type === 0 ? {} : ''
    expandAll.value = false
}
</script>

<template>
    <div
        m-2 mr-1 w-full flex flex-col rounded-2 bg-white pt-1 dark:bg-gray-800>
        <div flex-1 @click.right="showContextMenu($event)">
            <div v-if="(!state.templateSetVisible && !state.templateSelectVisible) || state.templateSetReopen">
                <n-scrollbar max-h-90vh>
                    <n-tree
                        draggable
                        block-line
                        expand-on-click
                        default-expand-all
                        :check-on-click="expandAll"
                        text-left
                        :data="data"
                        :node-props="nodeProps"
                        :on-update:expanded-keys="updatePrefixWithExpanded"
                        @drop="handleDrop" />
                </n-scrollbar>
            </div>
            <div v-else pl-3 text-left>
                <n-skeleton text class="w-50%" />
                <n-skeleton text class="ml-7 w-50%" />
                <n-skeleton text class="ml-14 w-60%" />
                <n-skeleton text class="ml-7 w-70%" />
                <n-skeleton text class="ml-14 w-40%" />
                <n-skeleton text class="ml-21 w-40%" />
                <n-skeleton text class="w-40%" />
                <n-skeleton text class="ml-7 w-50%" />
                <n-skeleton text class="ml-14 w-40%" />
                <n-skeleton text class="ml-21 w-40%" />
            </div>
        </div>
        <TheFooter />
        <n-popover trigger="manual" :show="inputPopoverShow" :x="inputPopoverX" :y="inputPopoverY" placement="right" :on-clickoutside="() => inputPopoverShow = false">
            <div flex-inline>
                <n-input v-model:value="inputPopoverValue" placeholder="" type="text" size="small" mr-2 />
                <n-button size="small" type="success" mr-2 @click="changeFileName">
                    确认
                </n-button>
                <n-popconfirm
                    negative-text="取消"
                    positive-text="确认"
                    @positive-click="deleteFile">
                    <template #trigger>
                        <n-button size="small" type="error">
                            删除
                        </n-button>
                    </template>
                    是否确认删除
                </n-popconfirm>
            </div>
        </n-popover>
        <n-popover trigger="manual" :show="createPopoverShow" :x="createPopoverX" :y="createPopoverY" placement="right" :on-clickoutside="() => createPopoverShow = false">
            <div flex-inline>
                <n-button size="small" type="info" mr-3 @click="createFileOrFolder(0)">
                    新建文件夹
                </n-button>
                <n-button size="small" type="primary" @click="createFileOrFolder(1)">
                    新建文件
                </n-button>
            </div>
        </n-popover>
    </div>
</template>
