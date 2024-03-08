<template>
    <div>
        <n-modal
            v-model:show="state.templateChooseVisible"
            :mask-closable="false"
            :close-on-esc="false"
            :closable="false"
            :show-icon="false"
            class="relative"
            preset="dialog">
            <template #header>
                <div absolute top-0 right-0 w-65px h-70px overflow-hidden>
                    <n-popover :show-icon="false" :show="extShow" trigger="manual" :on-clickoutside="() => extShow = false">
                        <template #trigger>
                            <n-button size="small" rotate-45 w-100px h-20px type="error" text-sm @click="() => extShow = true">
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
                <p my-0 mx-a mb-5>
                    模板选择
                </p>
            </template>
            <template #default>
                <n-button
                    v-for="(item, index) in templates"
                    :key="index"
                    w-full
                    h-50px
                    mb-5
                    relative
                    @click="onClick(item)">
                    <template #icon>
                        <Icon :icon="item.icon" />
                    </template>
                    <div v-if="item.source !== ''" absolute top-0 right-0 w-30px h-full overflow-hidden>
                        <n-popover trigger="hover" placement="right">
                            <template #trigger>
                                <n-tag size="small" bg-red rotate-45 w-50px h-10px text-xs />
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
import { useState } from '~/store/state'

const route = useRoute()
const state = useState()
const message = useMessage()
const loadingBar = useLoadingBar()

const templates: Ref<Array<Record<any, any>>> = ref([])
const noRepeat: { [key: string]: boolean } = {}

async function loadConfig(source: string) {
    const res = await state.get(`${source}/config.json`)
    const data = await res.data.text()
    const config = JSON.parse(data)
    config.templates.forEach((item: any) => {
        item.source = source
        if ((item.source + item.config) in noRepeat)
            return
        noRepeat[item.source + item.config] = true
        templates.value.push(item)
    })
}

async function onClick(item: Record<any, any>) {
    state.templateSource = item.source
    await state.chooseTemplate(item.config)
}

const extLink: Ref<any> = ref('')
const extShow = ref(false)
async function configExtLink() {
    loadingBar.start()
    try {
        await state.get(`${extLink.value}/config.json`)
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
