export const IS_LOCALHOST = Boolean(
    window.location.hostname === "localhost" ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === "[::1]" ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

const ENV_SERVER = process.env.REACT_APP_SERVER;
const ENV_NEW_SERVER = process.env.REACT_APP_NEW_SERVER;
const ENV_PASSPORT_OCR_PATH = process.env.REACT_APP_PASSPORT_OCR_PATH;

export const

    ENQUEUE_SNACKBAR = 'ENQUEUE_SNACKBAR',
    CLOSE_SNACKBAR = 'CLOSE_SNACKBAR',
    REMOVE_SNACKBAR = 'REMOVE_SNACKBAR',

    INIT_USER = 'INIT_USER',
    UPD_APP = 'UPD_APP',
    CLOSE_GOOD = 'CLOSE_GOOD',
    DELETE_GOOD = 'DELETE_GOOD',
    EXIT_APP = 'EXIT_APP',

    SERVER = ENV_SERVER || (IS_LOCALHOST ?
        'http://127.0.0.1:8000' :
        'https://api.uchet.store'),

    PASSPORT_OCR_PATH = ENV_PASSPORT_OCR_PATH || 'ocr/passport',

    NEW_SERVER = ENV_NEW_SERVER || (IS_LOCALHOST ?
        'http://127.0.0.1:8000' :
        'https://api.appblog.ru');
