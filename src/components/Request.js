// const isLocalhost = Boolean(
//     window.location.hostname === "localhost" ||
//     // [::1] is the IPv6 localhost address.
//     window.location.hostname === "[::1]" ||
//     // 127.0.0.1/8 is considered localhost for IPv4.
//     window.location.hostname.match(
//         /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
//     )
// );
// const SERVER = isLocalhost ?
//     'http://work.rr' :
//     'https://uchet.store';

const SERVER = 'https://uchet.store';

export default function fetchPost(data = {}, url = "", jwt = "") {

    let circularln = document.getElementById('circularln');
    if (circularln) circularln.style.display = '';

    let headers = {
        'Content-Type': 'application/json'
    };
    if (jwt) {
        headers['Jwt'] = jwt
        headers['Authorization'] = jwt
    }
    let init = {
        method: 'POST',
        mode: 'cors', // no-cors, cors, *same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers,
    }
    if (data) init.body = JSON.stringify(data);

    return fetch(SERVER + '/api' + url, init)
        .then(res => {
            if (circularln) circularln.style.display = 'none';
            return res.json()
        })
        .then(data => data === undefined ? {result: false} : data)
        .catch(error => {
            if (circularln) circularln.style.display = 'none';
            console.error('Ошибка запроса: ', error)
            return {result: false}
        });

}