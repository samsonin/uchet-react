import rest from "./Rest";


export default function fetchPost(data = {}, url = "", jwt = "") {

    return rest('api' + url, 'POST', data, false, {
        auth: false,
        responseType: 'json',
        updateStore: false,
        headers: jwt
            ? {
                Jwt: jwt,
                Authorization: jwt,
            }
            : {},
    })
        .then(res => res?.body === undefined ? {result: false} : res.body)
        .catch(error => {
            console.error('РћС€РёР±РєР° Р·Р°РїСЂРѕСЃР°: ', error)
            return {result: false}
        });

}
