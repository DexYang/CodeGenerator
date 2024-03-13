<template>
    <n-modal
        v-model:show="state.templateSetVisible"
        :mask-closable="state.templateSetReopen"
        :close-on-esc="state.templateSetReopen"
        closable
        :show-icon="false"
        :on-after-enter="onAfterEnter"
        :on-close="onClose"
        class="w-80%!"
        preset="card">
        <template #header>
            <p m-0>
                模板参数配置
            </p>
        </template>
        <template #default>
            <div v-if="config.variables">
                <n-divider title-placement="left">
                    {{ config.custom && config.custom.variable ? config.custom.variable : "变量" }}
                </n-divider>
                <n-form
                    ref="formRef"
                    inline
                    :label-width="80"
                    :model="variables"
                    size="small">
                    <n-form-item
                        v-for="(item, key) in config.variables"
                        :key="key"
                        :label="item.label"
                        :path="key.toString()"
                        :rule="{
                            required: true,
                            validator: item.rule ? evalRule(item.rule) : undefined,
                            trigger: ['input', 'blur'],
                        }">
                        <NInput v-model:value="variables[key.toString()]" :placeholder="key.toString()" />
                    </n-form-item>
                </n-form>
            </div>

            <div v-if="config.fields">
                <n-divider title-placement="left">
                    {{ config.custom && config.custom.field ? config.custom.field : "字段" }}
                </n-divider>
                <n-data-table :columns="columns" :data="fields" />
            </div>

            <div v-if="config.mock">
                <n-divider title-placement="left">
                    <NButton text @click="openWindow">
                        Mock数据模板定义
                    </NButton>
                </n-divider>
                <Codemirror
                    v-model="mockData"
                    placeholder="Code goes here..."
                    :style="{ height: '100%' }"
                    :autofocus="true"
                    :indent-with-tab="true"
                    :tab-size="2"
                    :extensions="extensions" />
            </div>
        </template>
        <template #footer>
            <n-space float-right>
                <NButton tertiary type="info" @click="addRow">
                    <n-icon mr-2>
                        <Add />
                    </n-icon>
                    添加{{ config.custom && config.custom.field ? config.custom.field : "字段" }}
                </NButton>
                <NButton tertiary type="primary" @click="asyncGenerate">
                    <n-icon mr-2>
                        <Code />
                    </n-icon>
                    生成
                </NButton>
            </n-space>
        </template>
    </n-modal>
</template>

<script lang="ts" setup>
import { Add, Code } from '@vicons/ionicons5'
import type { DataTableColumns, FormInst } from 'naive-ui'
import { NButton, NInput, NSelect, NSwitch, useLoadingBar, useMessage } from 'naive-ui'

import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { useState } from '~/store/state'

const state = useState()
const config: Ref<Record<any, any>> = ref({})

const variables: Ref<Record<any, any>> = ref({})
const fields: Ref<Array<Record<any, any>>> = ref([])

const columns: Ref<DataTableColumns<Record<any, any>>> = ref([])
const requiredFieldOptions: Ref<Array<string>> = ref([])

const extensions = computed(() => {
    const res = [javascript(), oneDark]
    return isDark.value ? res : res.slice(0, 1)
})

const mockData = ref('')

const formRef = ref<FormInst | null>(null)
const message = useMessage()
const loadingBar = useLoadingBar()

async function onAfterEnter() {
    const res = await state.get(state.templateConfig)
    const data = await res.data.text()
    config.value = JSON.parse(data)

    if (config.value.mock) {
        if (state.mockData === '') {
            const mockRaw = await state.get(config.value.mock)
            mockData.value = await mockRaw.data.text()
        } else {
            mockData.value = state.mockData
        }
    }

    if (Object.keys(state.variables).length === 0) {
        if (config.value.variables)
        { for (const key in config.value.variables) {
            const item = config.value.variables[key]
            variables.value[key] = item.default
        } }
    } else {
        variables.value = state.variables
    }

    if (state.fields.length === 0) {
        if (config.value.fields)
        { for (const item of config.value.fields) {
            item.key = Math.random().toString()
            fields.value.push(item)
        } }
    } else {
        fields.value = state.fields
    }
    columns.value = createColumns(config.value.fieldOptions)
}

function createColumns(fieldOptions: Record<any, any>): DataTableColumns<Record<any, any>> {
    const res: any = []
    for (const key in fieldOptions) {
        const item = fieldOptions[key]
        if (item.require)
            requiredFieldOptions.value.push(key)
        if (item.type === 'function')
            continue
        const temp = {
            title: item.label,
            resizable: true,
            key,
            render(row: any, index: any) {
                if (item.type === 'input') {
                    return h(NInput, {
                        value: row[key],
                        status: ((item.require && !fields.value[index][key]) || (item.rule && fields.value[index][key] && !evalRule(item.rule)(fields.value[index][key]))) ? 'error' : 'success',
                        onUpdateValue(v: any) {
                            fields.value[index][key] = v
                        }
                    })
                } else if (item.type === 'bool') {
                    return h(NSwitch, {
                        value: row[key],
                        onUpdateValue(v) {
                            fields.value[index][key] = v
                        }
                    })
                }
                else if (item.type === 'select') {
                    return h(NSelect, {
                        value: row[key],
                        clearable: true,
                        status: (!item.require || fields.value[index][key]) ? 'success' : 'error',
                        options: item.options.map((i: string) => { return { label: i, value: i } }),
                        onUpdateValue(v) {
                            fields.value[index][key] = v
                        }
                    })
                }
            }
        }
        res.push(temp)
    }
    res.push({
        title: '操作',
        key: 'actions',
        render(row: any) {
            return h(
                NButton,
                {
                    strong: true,
                    tertiary: true,
                    size: 'small',
                    type: 'error',
                    onClick: () => deleteRow(row)
                },
                { default: () => '删除' }
            )
        }
    })
    return res
}

function deleteRow(row: any) {
    let index = 0
    for (let i = 0; i < fields.value.length; i++) {
        if (fields.value[i].key === row.key) {
            index = i
            break
        }
    }
    fields.value.splice(index, 1)
}

function addRow() {
    fields.value.splice(0, 0, { key: Math.random().toString() })
}

async function asyncGenerate() {
    try {
        await formRef.value?.validate()
        validateRequiredFields()
        message.success('开始生成代码')
        loadingBar.start()
        state.variables = variables.value
        state.setMock(mockData.value)
        state.setFields(fields.value, config.value.fieldOptions)
        state.templates = config.value.templates
        await state.loadFileStructure(config.value.fileStructure)
        await state.generate()
        loadingBar.finish()
        state.templateSetVisible = false
    }
    catch (error) {
        console.log(error)
        message.error('请填写必填内容')
    }
}

function validateRequiredFields() {
    for (let i = 0; i < fields.value.length; i++) {
        const item = fields.value[i]
        for (let j = 0; j < requiredFieldOptions.value.length; j++) {
            const op = requiredFieldOptions.value[j]
            if (!item[op])
                throw new Error('nothing to say')
        }
    }
}

function evalRule(value: string) {
    // eslint-disable-next-line no-eval
    return eval(value)
}

function onClose() {
    if (!state.templateSetReopen) {
        state.templateChooseVisible = true
        state.templateSetVisible = false
        variables.value = {}
        fields.value = []
        columns.value = []
        requiredFieldOptions.value = []
    }
}

function openWindow() {
    window.open('https://lavyun.gitee.io/better-mock/document/syntax-specification.html#%E6%95%B0%E6%8D%AE%E6%A8%A1%E6%9D%BF%E5%AE%9A%E4%B9%89%E8%A7%84%E8%8C%83-dtd')
}
</script>
