<template>
    <n-modal
        v-model:show="state.templateChooseVisible"
        :mask-closable="false"
        :close-on-esc="false"
        :closable="false"
        :show-icon="false"
        preset="dialog">
        <template #header>
            <p my-0 mx-a mb-5>
                模板选择
            </p>
        </template>
        <template #default>
            <n-button
                v-for="item in config.templates"
                :key="item"
                w-full
                h-50px
                mb-5
                @click="onClick(item.config)">
                <template #icon>
                    <Icon :icon="item.icon" />
                </template>
                {{ item.description }}
            </n-button>
        </template>
    </n-modal>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import { useState } from '~/store/state'
import { get } from '~/api/resource'

const state = useState()

const config: Ref<Record<any, any>> = ref({})

function loadConfig() {
    get('config.json').then((res) => {
        res.data.text().then((data: string) => {
            config.value = JSON.parse(data)
        })
    })
}

async function onClick(config: string) {
    await state.chooseTemplate(config)
}

loadConfig()
</script>
