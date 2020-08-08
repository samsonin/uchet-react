import {SERVER} from '../constants';

let response = {};

export default function fetchPost(url, method = 'GET', data = '') {

    let jwt = JSON.parse(window.localStorage.getItem('auth')).jwt;

    if (typeof jwt !== "string") return false;

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

    // тестовая организация
    let server = JSON.parse(window.localStorage.getItem('auth')).organization_id === 5 ?
        'https://api.uchet.store' :
        SERVER;

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
