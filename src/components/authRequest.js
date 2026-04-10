import { SERVER } from '../constants';
import { enqueueSnackbar } from "../actions/actionCreator";


export default async function authRequest(data = {}, url = '') {

    const circularln = document.getElementById('circularln');

    const init = {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
        },
        ...(data ? { body: JSON.stringify(data) } : {}),
    };

    if (circularln) circularln.style.display = '';

    return fetch(`${SERVER}/${url}`, init)
        .finally(() => {
            if (circularln) circularln.style.display = 'none';
        })
        .catch(error => {
            if (circularln) circularln.style.display = 'none';
            enqueueSnackbar("Ошибка сети", { variant: "error" });
            return null; // или другое значение по умолчанию
        });

}