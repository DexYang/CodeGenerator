<template>
    <div>
        <n-modal
            v-model:show="state.templateSelectVisible"
            :mask-closable="false"
            :close-on-esc="false"
            :closable="false"
            :show-icon="false"
            class="relative"
            preset="dialog">
            <template #header>
                <div absolute right-0 top-0 h-70px w-65px overflow-hidden>
                    <n-popover :show-icon="false" :show="extShow" trigger="manual" :on-clickoutside="() => extShow = false">
                        <template #trigger>
                            <n-button size="small" type="error" h-20px w-100px rotate-45 text-sm @click="() => extShow = true">
                                EXT
                            </n-button>
                        </template>
                        <div flex-inline>
                            <n-input v-model:value="extLink" placeholder="" type="text" size="small" mr-2 />
                            <n-button size="small" type="success" mr-2 @click="configExtLink">
                                确认
                            </n-button>
                        </div>
                    </n-popover>
                </div>
                <p mx-a my-0 mb-5>
                    模板选择
                </p>
            </template>
            <template #default>
                <n-button
                    v-for="(item, index) in templates"
                    :key="index"
                    relative mb-5 h-50px w-full
                    @click="state.selectTemplate(item)">
                    <template #icon>
                        <Icon :icon="item.icon" />
                    </template>
                    <div v-if="item.source !== ''" absolute right-0 top-0 h-full w-30px overflow-hidden>
                        <n-popover trigger="hover" placement="right">
                            <template #trigger>
                                <n-tag size="small" h-10px w-50px rotate-45 bg-red text-xs />
                            </template>
                            外部链接地址:
                            <p m-0>
                                {{ item.source }}
                            </p>
                        </n-popover>
                    </div>
                    {{ item.description }}
                </n-button>
            </template>
        </n-modal>
    </div>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import { useLoadingBar, useMessage } from 'naive-ui'
import { useRoute } from 'vue-router'
import type { ResourceConfig } from '~/store/state'
import { useState } from '~/store/state'
import { get } from '~/api/request'

const route = useRoute()
const state = useState()
const message = useMessage()
const loadingBar = useLoadingBar()

const templates: Ref<Array<ResourceConfig>> = ref([])
const noRepeat: { [key: string]: boolean } = {}

const extLink: Ref<any> = ref('')
const extShow = ref(false)

async function loadConfig(source: string) {
    const resourceBaseBlob = await get(`${source}/config.json`)
    const rawData = await resourceBaseBlob.data.text()
    const resourceConfig = JSON.parse(rawData)
    resourceConfig.templates.forEach((item: ResourceConfig) => {
        item.source = source
        item.key = source + item.config
        if (!(item.key in noRepeat)) {
            noRepeat[item.key] = true
            templates.value.push(item)
        }
    })
}

async function configExtLink() {
    loadingBar.start()
    try {
        loadConfig(extLink.value)
        loadingBar.finish()
        extShow.value = false
    } catch (error) {
        message.error('该链接资源无法访问')
        loadingBar.error()
    }
}

onMounted(() => {
    loadConfig('')
    if ('url' in route.query) {
        extLink.value = route.query.url
        configExtLink()
    }
})
</script>
