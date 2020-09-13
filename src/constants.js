const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
  // [::1] is the IPv6 localhost address.
  window.location.hostname === "[::1]" ||
  // 127.0.0.1/8 is considered localhost for IPv4.
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

export const

  ENQUEUE_SNACKBAR = 'ENQUEUE_SNACKBAR',
  CLOSE_SNACKBAR = 'CLOSE_SNACKBAR',
  REMOVE_SNACKBAR = 'REMOVE_SNACKBAR',

  INIT_USER = 'INIT_USER',
  UPD_APP = 'UPD_APP',
  EXIT_APP = 'EXIT_APP',

  SERVER = isLocalhost ?
    'http://127.0.0.1:8000' :
    'https://api.uchet.store';
