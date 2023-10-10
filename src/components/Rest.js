import {SERVER, NEW_SERVER} from '../constants';
import store from '../store'


let response = {};

export default function fetchPost(url, method = 'GET', data = '', isFile = false) {

    let auth = JSON.parse(window.localStorage.getItem('auth'));

    let jwt = auth
        ? auth.jwt
        : ''

    let circularln = document.getElementById('circularln');
    if (circularln && url !== 'upd') circularln.style.display = '';

    let init = {
        method,
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
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

    let server = !jwt || JSON.parse(window.localStorage.getItem('auth')).organization_id > 1000
        ? NEW_SERVER
        : SERVER;

    return fetch(server + '/' + url, init)
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
            return res;
        })
        .then(res => res.json())
        .then(res => {
            response.body = res;
            return response;
        })
        .then(res => {

            if (res.status === 200) {

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