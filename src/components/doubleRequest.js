import {SERVER, NEW_SERVER} from '../constants';

export default function doubleRequest(data = {}, url = "") {

    let circularln = document.getElementById('circularln');

    let init = {
        method: 'POST',
        mode: 'cors', // no-cors, cors, *same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
            'Content-Type': 'application/json'
        },
    }
    if (data) init.body = JSON.stringify(data);

    function fetchReg(server) {

        if (circularln) circularln.style.display = '';

        return fetch(server + '/' + url, init)
            .finally(() => {
                if (circularln) circularln.style.display = 'none'
            });

    }

    return fetchReg(SERVER)
        .then(res => res.status > 299
            ? fetchReg(NEW_SERVER)
            : res
        )

}