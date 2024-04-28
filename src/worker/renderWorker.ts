import ejs from 'ejs'
import MD5 from 'crypto-js/md5'
import SHA256 from 'crypto-js/sha256'

const _md5 = MD5
const _sha256 = SHA256

globalThis.onmessage = function (event) {
    const { templateRaw, variables, fields, mockData } = event.data

    const render = ejs.compile(templateRaw)

    const renderData = render({
        variables,
        fields,
        data: mockData,
        _md5,
        _sha256
    })

    this.postMessage({ renderData })
}
