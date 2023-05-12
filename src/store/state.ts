import { defineStore } from 'pinia'
import { promiseTimeout } from '@vueuse/core'
import ejs from 'ejs'
import FileSaver from 'file-saver'
import JSZip from 'jszip'
import { get } from '~/api/resource'

interface State {
    templateChooseVisible: boolean
    templateSetVisible: boolean
    templateSetReopen: boolean
    templateConfig: string
    templateSelected: string | undefined
    fileStructure: Record<any, any>
    variables: Record<any, any>
    fields: Array<Record<any, any>>
    templates: Array<Record<any, any>>
}

export const useState = defineStore('state', {
    state: (): State => ({
        templateChooseVisible: true,
        templateSetVisible: false,
        templateSetReopen: false,
        templateConfig: '',
        templateSelected: '',
        fileStructure: {},
        variables: {},
        fields: [],
        templates: []
    }),
    actions: {
        async chooseTemplate(template: string): Promise<void> {
            await promiseTimeout(600)
            this.templateChooseVisible = false
            this.templateSetVisible = true
            this.templateConfig = template
        },
        async loadFileStructure(pathOrObj: string | object) {
            let data
            if (typeof pathOrObj === 'string') {
                const res = await get(pathOrObj)
                data = await res.data.text()
            }
            else {
                data = JSON.stringify(pathOrObj)
            }
            const render = ejs.compile(data)
            const fileStructureJson = render({ variables: this.variables })
            this.fileStructure = JSON.parse(fileStructureJson)
        },
        async generate() {
            for (let i = 0; i < this.templates.length; i++) {
                const item = this.templates[i]
                // 模板内容渲染
                const res = await get(item.from)
                const data = await res.data.text()
                const render = ejs.compile(data)
                const renderData = render({ variables: this.variables, fields: this.fields })
                // 目标路径渲染
                const renderPath = ejs.compile(item.to.toString())
                const path = renderPath({ variables: this.variables }).split('/')
                let loc = this.fileStructure
                for (let j = 0; j < path.length; j++) {
                    if (path[j] !== '')
                        loc = loc[path[j]]
                }
                // 目标文件名渲染
                const renderName = ejs.compile(item.name.toString())
                const name = renderName({ variables: this.variables })
                loc[name] = renderData
            }
            this.templateChooseVisible = false
        },
        setFields(fields: Array<Record<any, any>>, fieldOptions: Record<any, any>) {
            for (const key in fieldOptions) {
                const option = fieldOptions[key]
                if (option.type === 'function') {
                    // eslint-disable-next-line no-eval
                    const func = eval(option.function)
                    fields.map(item => func(item))
                }
            }
        },
        export() {
            const zip = new JSZip()
            function dfs(obj: any, path: string) {
                for (const key in obj) {
                    const item: any = obj[key]
                    if (Object.keys(item).length === 0) {
                        zip.folder(`${path}/${key}`)
                    }
                    else if (typeof item !== 'object') {
                        zip.folder(path)
                        const blob = new Blob([item])
                        zip.file(`${path}/${key}`, blob, { binary: true })
                    }
                    else {
                        dfs(item, `${path}/${key}`)
                    }
                }
            }
            dfs(this.fileStructure, '')
            zip.generateAsync({ type: 'blob' }).then((content) => {
                FileSaver.saveAs(content, 'code.zip')
            })
        }
    }
})
