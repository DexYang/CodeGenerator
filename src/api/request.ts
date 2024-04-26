import type { AxiosPromise } from 'axios'
import axios from 'axios'

const request = axios.create({
    // API 请求的默认前缀
    baseURL: import.meta.env.VITE_BASE_URL as string | undefined,
    timeout: 60000 // 请求超时时间
})

export default request

export function get(path: string): AxiosPromise {
    return request({
        url: `${path}`,
        method: 'get',
        responseType: 'blob'
    })
}
