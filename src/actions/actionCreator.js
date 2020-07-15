import {
    INIT_USER,
    UPD_APP,
    EXIT_APP,
} from "../constants";

export const ENQUEUE_SNACKBAR = 'ENQUEUE_SNACKBAR',
    CLOSE_SNACKBAR = 'CLOSE_SNACKBAR',
    REMOVE_SNACKBAR = 'REMOVE_SNACKBAR';

export const init_user = (jwt, user_id, organization_id, admin, expiration_time) => ({
    type: INIT_USER,
    jwt,
    user_id,
    organization_id,
    admin,
    expiration_time
});

export const upd_app = data => ({
    type: UPD_APP,
    data
});

export const exit_app = () => ({
    type: EXIT_APP
})

export const enqueueSnackbar = notification => {
    const key = notification.options && notification.options.key;

    return {
        type: ENQUEUE_SNACKBAR,
        notification: {
            ...notification,
            key: key || new Date().getTime() + Math.random(),
        },
    };
};

export const closeSnackbar = key => ({
    type: CLOSE_SNACKBAR,
    dismissAll: !key, // dismiss all if no key has been defined
    key,
});

export const removeSnackbar = key => ({
    type: REMOVE_SNACKBAR,
    key,
});
