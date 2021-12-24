import { AxiosError, AxiosRequestConfig } from 'axios'

export function formatAxiosError(err: AxiosError) {
    if (err.response) {
        return err.response.data
    } else {
        return err.message
    }
}

export function getAxiosRequestConfig(token: string, data: any = null): AxiosRequestConfig {
    const headers = {
        'Authorization': `Bearer ${token}` 
    }
    return {
        headers,
        data
    }
}