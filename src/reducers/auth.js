import {INIT_USER} from "../constants";

const auth = (state = JSON.parse(window.localStorage.getItem('auth')) || {user_id: 0}, {
        type, jwt, user_id, organization_id, admin, expiration_time
    }) => {
        if (type === INIT_USER) {
            let newAuth = {
                user_id
            }
            if (user_id > 0) {
                newAuth = Object.assign(newAuth,
                    {
                        jwt,
                        organization_id,
                        admin,
                        expiration_time,
                        time: Date.now()
                    }
                )
            }
            window.localStorage.setItem('auth', JSON.stringify(newAuth));
            return newAuth
        } else {
            return state
        }
    }

export default auth