import type { AxiosPromise } from 'axios'
import request from './request'

export function get(path: string): AxiosPromise {
    return request({
        url: `${path}`,
        method: 'get',
        responseType: 'blob'
    })
}
