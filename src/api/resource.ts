import type { AxiosPromise } from 'axios'
import request from './request'

const base = ''

export function getTemplates(file: string): AxiosPromise {
    return get(`templates/${file}`)
}

export function get(file: string): AxiosPromise {
    return request({
        url: `${base}/${file}`,
        method: 'get',
        responseType: 'blob'
    })
}
