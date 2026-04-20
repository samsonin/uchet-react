import {SERVER} from '../constants';
import store from '../store'


let response = {};

export default function fetchPost(url, method = 'GET', data = '', isFile = false, options = {}) {

    const {
        auth: useAuth = true,
        headers: customHeaders = {},
        responseType = 'json',
        updateStore = true,
        baseUrl = SERVER,
    } = options;

    let authData = JSON.parse(window.localStorage.getItem('auth'));

    let jwt = authData
        ? authData.jwt
        : ''

    let circularln = document.getElementById('circularln');
    if (circularln && url !== 'upd') circularln.style.display = '';

    let init = {
        method,
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
            ...(useAuth && jwt ? {'Authorization': 'Bearer ' + jwt} : {}),
            ...customHeaders,
        },
    }

    if (data) {

        if (isFile) {
            delete(init.headers["Content-Type"])
            init.enctype="multipart/form-data"

            const fd = new FormData()
            fd.append('image', data)

            init.body = fd
        } else {
            init.body = JSON.stringify(data)
        }

    }

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

            const body = await res.json();
            response.body = body;
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

            console.log(error)

            if (!response.ok) response.error = error;
            return response;
        })
        .finally(() => {
            if (circularln) circularln.style.display = 'none'
        });

}
