import {SERVER} from '../constants';
import store from '../store'

const NETWORK_ERROR_EVENT = 'app-network-error'
const DEFAULT_TIMEOUT_MS = 30000

const notifyNetworkError = detail => {
    window.dispatchEvent(new CustomEvent(NETWORK_ERROR_EVENT, {detail}))
}

export default function fetchPost(url, method = 'GET', data = '', isFile = false, options = {}) {
    let response = {};

    const {
        auth: useAuth = true,
        headers: customHeaders = {},
        responseType = 'json',
        updateStore = true,
        baseUrl = SERVER,
        credentials = 'same-origin',
        bodyType = '',
        fileFieldName = 'image',
        timeoutMs = DEFAULT_TIMEOUT_MS,
        showGlobalLoader = true,
    } = options;

    let authData = JSON.parse(window.localStorage.getItem('auth'));

    let jwt = authData
        ? authData.jwt
        : ''

    let circularln = document.getElementById('circularln');
    if (showGlobalLoader && circularln && url !== 'upd') circularln.style.display = '';

    let init = {
        method,
        mode: 'cors',
        cache: 'no-cache',
        credentials,
        headers: {
            'Content-Type': 'application/json',
            ...(useAuth && jwt ? {'Authorization': 'Bearer ' + jwt} : {}),
            ...customHeaders,
        },
    }

    if (data) {

        if (bodyType === 'formData' || data instanceof FormData) {
            delete(init.headers["Content-Type"])
            init.body = data
        } else if (isFile) {
            delete(init.headers["Content-Type"])
            init.enctype="multipart/form-data"

            const fd = new FormData()
            fd.append(fileFieldName, data)

            init.body = fd
        } else {
            init.body = JSON.stringify(data)
        }

    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    init.signal = controller.signal

    return fetch(baseUrl + '/' + url, init)
        .then(res => {

            if (res.status === 401) {

                // TODO перенаправить на главную страницу и окно авторизации

                // window.localStorage.setItem('auth', null)

                // window.history.pushState("prev state", null, "/");

            }

            response = {
                status: res.status,
                ok: res.ok
            };
            if (responseType === 'raw') {
                response.res = res;
                return res;
            }
            return res;
        })
        .then(async res => {
            if (responseType === 'raw') return res;

            if (responseType === 'text') {
                response.body = await res.text();
                return response;
            }

            if (responseType === 'auto') {
                const text = await res.text();

                try {
                    response.body = JSON.parse(text);
                } catch (error) {
                    response.body = text;
                }

                return response;
            }

            const text = await res.text();

            if (!text) {
                response.body = null;
                return response;
            }

            try {
                response.body = JSON.parse(text);
            } catch (error) {
                response.body = text;
            }

            return response;
        })
        .then(res => {

            if (responseType !== 'raw' && updateStore && res.status === 200 && typeof res.body === 'object' && res.body) {

                store.dispatch({
                    type: 'UPD_APP',
                    data: res.body
                })

            }

            return res
        })
        .catch(error => {

            const isNetworkError = error?.name === 'AbortError' || !response.status

            if (isNetworkError) {
                notifyNetworkError({
                    isTimeout: error?.name === 'AbortError',
                    url,
                })
            } else if (!String(error?.message || '').includes('Unexpected end of JSON input')) {
                console.log(error)
            }

            if (!response.ok) response.error = error;
            return response;
        })
        .finally(() => {
            clearTimeout(timeout)
            if (showGlobalLoader && circularln) circularln.style.display = 'none'
        });

}
