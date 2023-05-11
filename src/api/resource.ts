import type { AxiosPromise } from 'axios'
import request from './request'

const base = ''

export function get(file: string): AxiosPromise {
    return request({
        url: `${base}/${file}`,
        method: 'get',
        responseType: 'blob'
    })
}
