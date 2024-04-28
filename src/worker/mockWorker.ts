globalThis.window = {} as any

globalThis.onmessage = async function (event) {
    const { id, mockScript, total, extendTemplates, begin } = event.data

    // eslint-disable-next-line prefer-const
    let mock: any = {}

    const { default: Mock } = await (() => import('better-mock'))()

    for (const key in extendTemplates) {
        const value = extendTemplates[key]
        extendTemplates[key] = function () {
            return this.pick(value.split(','))
        }
    }

    Mock.Random.extend(extendTemplates)

    // eslint-disable-next-line no-eval
    eval(`mock = {
      'list|${total}': ${mockScript}
    }`)

    // 解决并行运行时自增的问题
    const reg = /^(.*)\|\+(\d+)$/

    for (const key of Object.keys(mock[`list|${total}`][0])) {
        const result = reg.exec(key)
        if (result) {
            const step = Number.parseInt(result[2])
            mock[`list|${total}`][0][key] += step * begin
        }
    }

    const mockData = Mock.mock(mock)

    this.postMessage({ id, mockData })
}
