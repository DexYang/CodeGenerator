import { defineStore } from 'pinia'
import { promiseTimeout } from '@vueuse/core'
import ejs from 'ejs'
import FileSaver from 'file-saver'
import JSZip from 'jszip'
import { get } from '~/api/resource'

interface State {
    templateChooseVisible: boolean
    templateSetVisible: boolean
    templateSetVisibleReopen: boolean
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
        templateSetVisibleReopen: false,
        templateConfig: '',
        templateSelected: '',
        fileStructure: {
            sql: {
                mysql: {
                    '2-ddl_for_update.sql': '-- 记录日志\ntee Log/2-ddl_for_update.log\n\n-- 当前时间\nselect now();\n\n-- 开始事务\nstart transaction;\n\n-- 以下填写变更SQL\nuse `sysdb`;\n\nSET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS = 0;\n\n-- ----------------------------\n-- Table structure for t_example\n-- ----------------------------\nCREATE TABLE `t_example` (\n\t`id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT \'ID\',\n\t`string_field` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT \'\' COMMENT \'string_field\',\n\t`state` tinyint(4) NOT NULL DEFAULT 0 COMMENT \'state\',\n\t`delete_flag` tinyint(4) NOT NULL DEFAULT 0 COMMENT \'逻辑删除标志\',\n\t`creator_id` bigint(20) NOT NULL DEFAULT 0 COMMENT \'创建者ID\',\n\t`insert_time` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT \'插入时间\',\n\t`update_time` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT \'更新时间\',\n\t`scope` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT \'\' COMMENT \'数据权限标识\',\n\tPRIMARY KEY (`id`) USING BTREE\n)ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = \'Example表\' ROW_FORMAT = Dynamic;\n\n\nSET FOREIGN_KEY_CHECKS = 1;\n\n-- 查询变更之后的结果\n\n-- 提交事务\ncommit;\n\n-- 查询当前时间\nselect now();\n\n-- 关闭日志记录\nnotee\n'
                },
                postgresql: {}
            },
            java: {
                com: {
                    cbit: {
                        caf2: {
                            modules: {
                                2312: {
                                    controller: {},
                                    Dao: {},
                                    DO: {},
                                    service: {
                                        impl: {}
                                    },
                                    VO: {}
                                }
                            }
                        }
                    }
                }
            },
            vue: {
                api: {
                    project_213: {
                        312412341: {}
                    }
                },
                views: {
                    project_213: {
                        312412341: {
                            _components: {}
                        }
                    }
                }
            }
        },
        variables: {},
        fields: [],
        templates: []
    }),
    actions: {
        async chooseTemplate(template: string): Promise<void> {
            await promiseTimeout(600)
            this.templateChooseVisible = false
            await promiseTimeout(100)
            this.templateSetVisible = true
            this.templateConfig = template
        },
        async loadFileStructure(path: string, variables: Record<any, any>) {
            const res = await get(path)
            const data = await res.data.text()
            const render = ejs.compile(data)
            const fileStructureJson = render({ variables })
            this.fileStructure = JSON.parse(fileStructureJson)
            this.variables = variables
        },
        async generate() {
            for (let i = 0; i < this.templates.length; i++) {
                const item = this.templates[i]
                const res = await get(item.from)
                const data = await res.data.text()
                const render = ejs.compile(data)
                const renderData = render({ variables: this.variables, fields: this.fields })
                const path = item.to.toString().split('/')
                let loc = this.fileStructure
                for (let j = 0; j < path.length; j++) {
                    if (path[j] !== '')
                        loc = loc[path[j]]
                }
                loc[item.name] = renderData
            }
            this.templateChooseVisible = false
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
                FileSaver.saveAs(content, '测试.zip') // 利用file-saver保存文件  自定义文件名
            })
        }
    }
})
