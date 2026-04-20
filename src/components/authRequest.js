import { enqueueSnackbar } from "../actions/actionCreator";
import rest from "./Rest";


export default async function authRequest(data = {}, url = '') {

    const circularln = document.getElementById('circularln');

    if (circularln) circularln.style.display = '';

    return rest(url, 'POST', data, false, {
        auth: false,
        responseType: 'raw',
        updateStore: false,
    })
        .catch(error => {
            if (circularln) circularln.style.display = 'none';
            enqueueSnackbar("РћС€РёР±РєР° СЃРµС‚Рё", { variant: "error" });
            return null;
        });

}
