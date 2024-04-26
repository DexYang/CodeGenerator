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
            <span m-0>
                模板参数配置
            </span>
            <span class="float-right">
                <NButton size="small" ghost type="primary" class="mr-5" @click="state.loadOriginConfig">
                    读取原始配置
                </NButton>
                <NSelect
                    ref="selectRef"
                    v-model:value="configName"
                    tag
                    :show-checkmark="false"
                    size="small"
                    placeholder="选择或保存配置 "
                    class="inline-block w-80"
                    filterable
                    :options="storageConfigList"
                    :render-label="renderOptions"
                    @update:value="onSelect" />
            </span>
        </template>
        <template #default>
            <div v-if="state.templateConfig!.variables">
                <n-divider title-placement="left">
                    {{ state.templateConfig!.custom && state.templateConfig!.custom.variable ? state.templateConfig!.custom.variable : "变量" }}
                </n-divider>
                <n-form
                    ref="formRef"
                    inline
                    :label-width="80"
                    :model="state.variables"
                    size="small">
                    <n-form-item
                        v-for="(item, key) in state.templateConfig!.variables"
                        :key="key"
                        :label="item.label"
                        :path="key.toString()"
                        :rule="{
                            required: true,
                            validator: item.rule ? evalRule(item.rule) : undefined,
                            trigger: ['input', 'blur'],
                        }">
                        <NInput v-model:value="state.variables[key.toString()]" :placeholder="key.toString()" />
                    </n-form-item>
                </n-form>
            </div>

            <div v-if="state.templateConfig!.fields">
                <n-divider title-placement="left">
                    {{ state.templateConfig!.custom && state.templateConfig!.custom.field ? state.templateConfig!.custom.field : "字段" }}
                </n-divider>
                <n-data-table :columns="columns" :data="state.fields" />
            </div>

            <div v-if="state.templateConfig!.mock">
                <n-divider title-placement="left">
                    <NButton text @click="openMockLink">
                        Mock数据模板定义(点击查看Mock语法)
                    </NButton>
                </n-divider>
                <Codemirror
                    v-model="state.mockData"
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
                <NButton tertiary type="info" @click="state.addRow">
                    <n-icon mr-2>
                        <Add />
                    </n-icon>
                    添加{{ state.templateConfig!.custom && state.templateConfig!.custom.field ? state.templateConfig!.custom.field : "字段" }}
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
import type { DataTableColumns, FormInst, SelectOption } from 'naive-ui'
import { NButton, NInput, NSelect, NSwitch, useLoadingBar, useMessage } from 'naive-ui'

import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { latest_key, useState } from '~/store/state'

const formRef = ref<FormInst | null>(null)
const message = useMessage()
const loadingBar = useLoadingBar()

const state = useState()
const selectRef = ref()

const columns: Ref<DataTableColumns<Record<any, any>>> = ref([])
const requiredFieldOptions: Ref<Array<string>> = ref([])

const configName = ref()
const storageConfigList = computed(() => {
    const res: Array<Record<string, string>> = []
    Object.keys(state.storageKeys).forEach((item) => {
        res.push({ label: item, value: state.storageKeys[item] })
    })
    return res
})

function renderOptions(option: SelectOption) {
    if (option.value === latest_key)
        return [option.label as string]
    return [
        option.label as string,
        h(
            'span',
            {
                class: 'absolute right-2 invisible  option-action'
            },
            [
                h(
                    NButton,
                    {
                        type: 'info',
                        ghost: true,
                        class: 'mr-2',
                        size: 'tiny',
                        onClick: (e) => {
                            e.stopPropagation()
                            state.saveConfigToLocalStorage(option.label as string, option.value as string)
                            selectRef.value.blur()
                        }
                    },
                    () => state.storageKeys[option.label as string] ? '覆盖' : '保存'
                ),
                h(
                    NButton,
                    {
                        type: 'error',
                        ghost: true,
                        size: 'tiny',
                        onClick: (e) => {
                            e.stopPropagation()
                            state.deleteConfigToLocalStorage(option.label as string, option.value as string)
                        }
                    },
                    () => '删除'
                )
            ]
        )
    ]
}

async function onSelect(value: string, option: any) {
    if (state.storageKeys[option.label as string])
        await state.loadSelectedConfig(value)
}

const extensions = computed(() => {
    const res = [javascript(), oneDark]
    return isDark.value ? res : res.slice(0, 1)
})

async function onAfterEnter() {
    if (!state.templateSetReopen) {
        configName.value = ''
        // await state.loadOriginTemplateConfig()
        columns.value = createColumns(state.templateConfig!.fieldOptions!)
    }
}

function createColumns(fieldOptions: Record<any, any>): DataTableColumns<Record<any, any>> {
    const res: any = []
    requiredFieldOptions.value = []
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
                        status: ((item.require && !state.fields[index][key]) || (item.rule && state.fields[index][key] && !evalRule(item.rule)(state.fields[index][key]))) ? 'error' : 'success',
                        onUpdateValue(v: any) {
                            state.fields[index][key] = v
                        }
                    })
                } else if (item.type === 'bool') {
                    return h(NSwitch, {
                        value: row[key],
                        onUpdateValue(v) {
                            state.fields[index][key] = v
                        }
                    })
                } else if (item.type === 'select') {
                    return h(NSelect, {
                        value: row[key],
                        clearable: true,
                        status: (!item.require || state.fields[index][key]) ? 'success' : 'error',
                        options: item.options.map((i: string) => { return { label: i, value: i } }),
                        onUpdateValue(v) {
                            state.fields[index][key] = v
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
                    onClick: () => state.deleteRow(row)
                },
                { default: () => '删除' }
            )
        }
    })
    return res
}

async function asyncGenerate() {
    try {
        await formRef.value?.validate()
        validateRequiredFields()
        message.success('开始生成代码')
        loadingBar.start()
        await state.generate()
        loadingBar.finish()
        state.templateSetVisible = false
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error)
        message.error('请填写具体参数')
    }
}

function validateRequiredFields() {
    for (let i = 0; i < state.fields.length; i++) {
        const item = state.fields[i]
        for (let j = 0; j < requiredFieldOptions.value.length; j++) {
            const op = requiredFieldOptions.value[j]
            if (!item[op])
                throw new Error('nothing to say')
        }
    }
}

function onClose() {
    if (!state.templateSetReopen)
        state.templateSelectVisible = true
}

function evalRule(value: string) {
    // eslint-disable-next-line no-eval
    return eval(value)
}

function openMockLink() {
    window.open('https://lavyun.gitee.io/better-mock/document/syntax-specification.html#%E6%95%B0%E6%8D%AE%E6%A8%A1%E6%9D%BF%E5%AE%9A%E4%B9%89%E8%A7%84%E8%8C%83-dtd')
}
</script>

<style>
.n-base-select-option--pending {
    .option-action {
        @apply visible!;
    }
}
</style>
