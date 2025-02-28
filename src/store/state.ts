/* eslint-disable no-console */
import { promiseTimeout, useStorage } from '@vueuse/core'
import MD5 from 'crypto-js/md5'
import SHA256 from 'crypto-js/sha256'
import ejs from 'ejs'
import FileSaver from 'file-saver'
import JSZip from 'jszip'
import { createDiscreteApi } from 'naive-ui'
import { defineStore } from 'pinia'
import { get } from '~/api/request'

import { WorkerManager } from '~/worker/workerManager'

if (import.meta.hot)
    import.meta.hot.accept()

export const latest_key_cn = '最新生成'
export const latest_key = 'latest__'

const { loadingBar, message } = createDiscreteApi(['loadingBar', 'message'])

const _md5 = MD5
const _sha256 = SHA256
console.log('预置函数_md5:', _md5)
console.log('预置函数_sha256:', _sha256)

interface FileStructure {
    [key: string]: FileStructure | string
}

export interface ResourceConfig {
    config: string
    description: string
    icon: string
    source: string
    key: string
}

export interface TemplateConfig {
    variables?: Record<string, Variables>
    fields?: Array<Record<string, string>>
    mock?: string

    fileStructure?: Record<string, any> | string // 不可变
    templates?: Array<Templates>
    fieldOptions?: Record<string, any>
    custom?: Record<string, string>
}

interface Variables {
    label: string
    default?: string | number
    rule?: string
}

interface Templates {
    name: string
    from: string
    to: string
}

interface MutableData {
    variables: Record<string, any>
    fields: Array<Record<string, any>>
    mockData?: string
}

interface State extends MutableData {
    resourceConfig?: ResourceConfig
    templateSelectVisible: boolean
    templateSetVisible: boolean
    templateSetReopen: boolean
    templateConfig?: TemplateConfig

    fileStructure: FileStructure
    mock: Record<string, any>

    templateSelected?: string

    storageKeys?: any
}

export const useState = defineStore('state', {
    state: (): State => ({
        resourceConfig: undefined,
        templateSelectVisible: true,
        templateSetVisible: false,
        templateSetReopen: false,

        templateConfig: undefined,
        mockData: '',
        variables: {},
        fields: [],
        fileStructure: {},

        mock: {}
    }),
    actions: {
        async selectTemplate(config: ResourceConfig) {
            await promiseTimeout(400)
            this.resourceConfig = config
            await this.loadTemplateConfig()
            this.templateSelectVisible = false
            this.templateSetVisible = true
        },
        async get(path: string) {
            const res = await get(`${
                this.resourceConfig?.source !== ''
                    ? `${this.resourceConfig?.source}/`
                    : ''}${path}`)
            return res
        },
        async loadTemplateConfig() {
            const TemplateConfigBlob = await this.get(this.resourceConfig!.config!)
            const TemplateConfigRaw = await TemplateConfigBlob.data.text()
            this.templateConfig = JSON.parse(TemplateConfigRaw)
            this.storageKeys = useStorage(`${this.resourceConfig!.key}__keys`, {})
            const data = this.getFromLocalStorage()
            if (data)
                message.info('自动读取上次成功生成的模板配置')
            await this.loadMutableData(data || this.templateConfig! as MutableData)
        },
        async loadOriginConfig() {
            loadingBar.start()
            await this.loadMutableData(this.templateConfig! as MutableData)
            loadingBar.finish()
        },
        async loadSelectedConfig(key?: string) {
            loadingBar.start()
            const data = this.getFromLocalStorage(key)
            await this.loadMutableData(data as MutableData)
            loadingBar.finish()
        },
        async loadMutableData(data: MutableData) {
            if (this.templateConfig!.mock) { // 加载mock数据
                if (data.mockData) {
                    this.mockData = data.mockData
                } else {
                    const mockBlob = await this.get(this.templateConfig!.mock)
                    this.mockData = await mockBlob.data.text()
                }
            }
            // debugger
            if (data.variables && Object.keys(data.variables).length !== 0) {
                this.variables = {}
                for (const key in data.variables) {
                    const item = data.variables[key]
                    this.variables[key] = item.default || (typeof item === 'string' ? item : '')
                }
            }
            if (data.fields && data.fields.length !== 0) {
                this.fields = []
                for (const item of data.fields) {
                    item.key = Math.random().toString()
                    this.fields.push(item)
                }
            }
        },

        async loadFileStructure() {
            let data
            if (typeof this.templateConfig!.fileStructure === 'string') {
                const res = await this.get(this.templateConfig!.fileStructure)
                data = await res.data.text()
            } else {
                data = JSON.stringify(this.templateConfig!.fileStructure)
            }
            const render = ejs.compile(data)
            const fileStructureJson = render({ variables: this.variables })
            this.fileStructure = JSON.parse(fileStructureJson)
        },
        async setFields() {
            for (const key in this.templateConfig!.fieldOptions!) {
                const option = this.templateConfig!.fieldOptions![key]
                if (option.type === 'function') {
                    // eslint-disable-next-line no-eval
                    const func = eval(option.function)
                    await this.fields.map(async item => func(item))
                }
            }
        },
        async generate() {
            loadingBar.start()
            await this.setFields()

            await this.loadFileStructure()

            let mockData = {}
            const wm = WorkerManager.getInstance()

            if (this.templateConfig!.mock) {
                const extendTemplates: Record<string, any> = {}
                for (let i = 0; i < this.fields.length; i++) {
                    const field = this.fields[i]
                    const key: any = field['__mock__dictName' as any]
                    const value: any = field['__mock__dictValue' as any]
                    extendTemplates[key] = value
                }

                mockData = await wm.mock(
                    this.mockData as string,
                    this.variables.__mock__total,
                    extendTemplates
                )
            }

            const promises = []

            for (let i = 0; i < this.templateConfig!.templates!.length; i++) {
                const item = this.templateConfig!.templates![i]
                // 模板内容渲染
                const templateBlob = await this.get(item.from)
                const templateRaw = await templateBlob.data.text()

                // 目标路径渲染
                const renderPath = ejs.compile(item.to.toString())
                const path = renderPath({ variables: this.variables }).split('/')
                let loc = this.fileStructure
                for (let j = 0; j < path.length; j++) {
                    if (path[j] !== '')
                        loc = loc[path[j]] as FileStructure
                }
                // 目标文件名渲染
                const renderName = ejs.compile(item.name.toString())
                const name = renderName({ variables: this.variables })

                // 异步渲染模板
                promises.push(
                    wm.render(
                        templateRaw,
                        this.variables,
                        this.fields,
                        mockData
                    ).then((renderData: any) => {
                        loc[name] = renderData
                    })
                )
            }

            await Promise.all(promises)
            loadingBar.finish()
            // 生成成功后保存本次参数
            this.saveToLocalStorage()
            this.storageKeys[latest_key_cn] = latest_key
        },
        saveConfigToLocalStorage(label: string, value: string) {
            loadingBar.start()
            this.storageKeys[label] = value
            this.saveToLocalStorage(value)
            loadingBar.finish()
        },
        deleteConfigToLocalStorage(label: string, value: string) {
            loadingBar.start()
            delete this.storageKeys[label]
            localStorage.removeItem(`${this.resourceConfig!.key}__${value}`)
            loadingBar.finish()
        },
        saveToLocalStorage(key?: string) {
            const data: MutableData = {
                variables: this.variables,
                fields: this.fields,
                mockData: this.mockData
            }
            localStorage.setItem(`${this.resourceConfig!.key}__${key || latest_key}`, JSON.stringify(data))
        },
        getFromLocalStorage(key?: string): MutableData {
            const jsonString = localStorage.getItem(`${this.resourceConfig!.key}__${key || latest_key}`)
            return JSON.parse(jsonString!) as MutableData
        },

        deleteRow(row: any) {
            let index = 0
            for (let i = 0; i < this.fields.length; i++) {
                if (this.fields[i].key === row.key) {
                    index = i
                    break
                }
            }
            this.fields.splice(index, 1)
        },
        addRow() {
            this.fields.splice(0, 0, { key: Math.random().toString() })
        },
        export() {
            loadingBar.start()
            const zip = new JSZip()
            function dfs(obj: any, path: string) {
                for (const key in obj) {
                    const item: any = obj[key]
                    if (Object.keys(item).length === 0) {
                        zip.folder(`${path}/${key}`)
                    } else if (typeof item !== 'object') {
                        zip.folder(path)
                        const blob = new Blob([item])
                        zip.file(`${path}/${key}`, blob, { binary: true })
                    } else {
                        dfs(item, `${path}/${key}`)
                    }
                }
            }
            dfs(this.fileStructure, '')
            zip.generateAsync({ type: 'blob' }).then((content) => {
                FileSaver.saveAs(content, 'Code.zip')
                loadingBar.finish()
            })
        }
    }
})
