/* eslint-disable no-console */
import { defineStore } from 'pinia'
import { promiseTimeout } from '@vueuse/core'
import ejs from 'ejs'
import FileSaver from 'file-saver'
import JSZip from 'jszip'
import { createDiscreteApi } from 'naive-ui'
import MD5 from 'crypto-js/md5'
import SHA256 from 'crypto-js/sha256'
import Mock from 'better-mock'
import { get } from '~/api/resource'

const { loadingBar } = createDiscreteApi(['loadingBar'])

const _md5 = MD5
const _sha256 = SHA256
console.log('预置函数_md5:', _md5)
console.log('预置函数_sha256:', _sha256)

interface FileStructure {
    [key: string]: FileStructure | string
}

interface Templates {
    name: string
    from: string
    to: string
}

interface State {
    templateSource: string
    templateKey: string
    templateChooseVisible: boolean
    templateSetVisible: boolean
    templateSetReopen: boolean
    templateConfig: string
    fileStructure: FileStructure
    variables: Record<string, any>
    mockData: string
    mock: Record<string, any>
    fields: Array<Record<string, any>>
    templates: Array<Templates>
}

export const useState = defineStore('state', {
    state: (): State => ({
        templateSource: '',
        templateKey: '',
        templateChooseVisible: true,
        templateSetVisible: false,
        templateSetReopen: false,
        templateConfig: '',
        fileStructure: {},
        variables: {},
        mockData: '',
        fields: [],
        mock: {},
        templates: []
    }),
    actions: {
        async chooseTemplate(template: string): Promise<void> {
            await promiseTimeout(400)
            this.templateChooseVisible = false
            this.templateSetVisible = true
            this.templateConfig = template
        },
        async loadFileStructure(pathOrObj: string | object) {
            let data
            if (typeof pathOrObj === 'string') {
                const res = await this.get(pathOrObj)
                data = await res.data.text()
            } else {
                data = JSON.stringify(pathOrObj)
            }
            const render = ejs.compile(data)
            const fileStructureJson = render({ variables: this.variables })
            this.fileStructure = JSON.parse(fileStructureJson)
        },
        async generate() {
            const extendTemplates: Record<string, any> = {}
            for (let i = 0; i < this.fields.length; i++) {
                const field = this.fields[i]
                const key: any = field['__mock__dictName' as any]
                const value: any = field['__mock__dictValue' as any]
                if (key) {
                    extendTemplates[key] = function () {
                        return this.pick(value.split(','))
                    }
                }
            }
            Mock.Random.extend(extendTemplates)
            const mockData = Mock.mock(this.mock)

            for (let i = 0; i < this.templates.length; i++) {
                const item = this.templates[i]
                // 模板内容渲染
                const res = await this.get(item.from)
                const data = await res.data.text()
                const render = ejs.compile(data)

                const renderData = render({
                    variables: this.variables,
                    fields: this.fields,
                    data: mockData,
                    _md5,
                    _sha256
                })
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
                loc[name] = renderData
            }
            this.templateChooseVisible = false
        },
        async get(path: string) {
            const res = await get(`${this.templateSource !== '' ? `${this.templateSource}/` : ''}${path}`)
            return res
        },
        async setFields(fields: Array<Record<any, any>>, fieldOptions: Record<any, any>) {
            for (const key in fieldOptions) {
                const option = fieldOptions[key]
                if (option.type === 'function') {
                    // eslint-disable-next-line no-eval
                    const func = eval(option.function)
                    await fields.map(async item => func(item))
                }
            }
            this.fields = fields
        },
        async setMock(mockData: string) {
            this.mockData = mockData
            // eslint-disable-next-line no-eval
            eval(mockData)
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
