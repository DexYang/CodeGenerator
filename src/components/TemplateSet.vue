<template>
    <n-modal
        v-model:show="state.templateSetVisible"
        :mask-closable="state.templateSetReopen"
        :close-on-esc="state.templateSetReopen"
        :closable="state.templateSetReopen"
        :show-icon="false"
        :on-after-enter="onAfterEnter"
        class="w-80%!"
        preset="card">
        <template #header>
            <p m-0>
                模板参数配置
            </p>
        </template>
        <template #default>
            <n-divider title-placement="left">
                模板变量
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
                    :label="item.label" :path="key.toString()" :rule="{
                        required: true,
                        trigger: ['input', 'blur'],
                    }">
                    <NInput v-model:value="variables[key.toString()]" :placeholder="key.toString()" />
                </n-form-item>
            </n-form>
            <n-divider title-placement="left">
                字段
            </n-divider>
            <n-data-table :columns="columns" :data="fields" />
        </template>
        <template #footer>
            <n-space float-right>
                <NButton tertiary type="info" @click="addRow">
                    <n-icon mr-2>
                        <Add />
                    </n-icon>
                    添加字段
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
import { useState } from '~/store/state'
import { get } from '~/api/resource'

const state = useState()
const config: Ref<Record<any, any>> = ref({})

const variables: Ref<Record<any, any>> = ref({})
const fields: Ref<Array<Record<any, any>>> = ref([])
const columns: Ref<DataTableColumns<Record<any, any>>> = ref([])
const requiredFieldOptions: Ref<Array<string>> = ref([])

const formRef = ref<FormInst | null>(null)
const message = useMessage()
const loadingBar = useLoadingBar()

function onAfterEnter() {
    get(state.templateConfig).then((res) => {
        res.data.text().then((data: string) => {
            config.value = JSON.parse(data)
            if (Object.keys(state.variables).length === 0) {
                for (const key in config.value.variables) {
                    const item = config.value.variables[key]
                    variables.value[key] = item.default
                }
            }
            else {
                variables.value = state.variables
            }

            if (state.fields.length === 0) {
                for (const item of config.value.fields) {
                    item.key = Math.random().toString()
                    fields.value.push(item)
                }
            }
            else {
                fields.value = state.fields
            }
            columns.value = createColumns(config.value.fieldOptions)
        })
    })
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
                        status: (!item.require || fields.value[index][key]) ? 'success' : 'error',
                        onUpdateValue(v: any) {
                            fields.value[index][key] = v
                        }
                    })
                }
                else if (item.type === 'bool') {
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
        state.fields = fields.value
        state.setFields(fields.value, config.value.fieldOptions)
        state.templates = config.value.templates
        await state.loadFileStructure(config.value.fileStructure)
        await state.generate()
        loadingBar.finish()
        state.templateSetVisible = false
    }
    catch (error) {
        // eslint-disable-next-line no-console
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
</script>
