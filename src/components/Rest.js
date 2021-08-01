import {SERVER, NEW_SERVER} from '../constants';

let response = {};

export default function fetchPost(url, method = 'GET', data = '') {

    let auth = JSON.parse(window.localStorage.getItem('auth'));

    let jwt = auth
        ? auth.jwt
        : ''

    let circularln = document.getElementById('circularln');
    if (circularln) circularln.style.display = '';

    let init = {
        method,
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
        },
    }
    if (data) init.body = JSON.stringify(data);

    let server = !jwt || JSON.parse(window.localStorage.getItem('auth')).organization_id > 1000
        ? NEW_SERVER
        : SERVER;

    return fetch(server + '/' + url, init)
        .then(res => {
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
        .catch(error => {
            if (!response.ok) response.error = error;
            return response;
        })
        .finally(() => {
            if (circularln) circularln.style.display = 'none'
        });

}
