import MockWorker from './mockWorker?worker'
import RenderWorker from './renderWorker?worker'

export const batch = 20000

export class WorkerManager {
    private static instance: WorkerManager

    public static getInstance() {
        if (!WorkerManager.instance)
            WorkerManager.instance = new WorkerManager()

        return WorkerManager.instance
    }

    async mock(mockScript: string, total: number, extendTemplates: Record<string, any>) {
        const __batch = Math.max(batch, total / 10) // 最多10个worker

        const workers: Array<Worker> = []
        const promises = []
        let __total = total

        let begin = 0

        while (__total > 0) {
            const worker = new MockWorker()
            const id = Math.random().toString()
            // 余量不足batch x2 时, 一次完成
            let __temp = __total
            if (__total - __batch < __batch) {
                __temp = __total
                __total = 0
            } else {
                __temp = __batch
                __total -= __batch
            }

            // 请求worker
            worker.postMessage({
                total: __temp,
                mockScript,
                extendTemplates,
                id,
                begin
            })
            begin += __temp
            // worker.onmessage = onmessage
            promises.push(new Promise((resolve) => {
                worker.onmessage = (e) => {
                    const { mockData } = e.data
                    resolve(mockData)
                }
            }))
            workers.push(worker)
        }

        // 等待所有worker返回数据
        const mockDataList: any = await Promise.all(promises)

        // 关闭所有worker
        for (const worker of workers)
            worker.terminate()

        // 组合结果
        const res: { list: Array<any> } = { list: [] }
        for (const item of mockDataList)
            res.list.push(...item.list)

        return res
    }

    async render(templateRaw: string, variables: any, fields: any, mockData: any) {
        const worker = new RenderWorker()
        // proxy对象传不进去
        const __variables: any = {}
        for (const key in variables)
            __variables[key] = variables[key]
        const __fields: any = []
        for (const key in fields)
            __fields.push(Object.assign({}, fields[key]))

        // RenderWorker请求
        worker.postMessage({
            templateRaw,
            variables: __variables,
            fields: __fields,
            mockData
        })

        // 等待worker返回
        const res = await new Promise((resolve) => {
            worker.onmessage = (e) => {
                const { renderData } = e.data
                resolve(renderData)
            }
        })

        worker.terminate()
        return res
    }
}
