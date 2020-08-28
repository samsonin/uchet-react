import {useEffect} from "react";
import {closeSnackbar, enqueueSnackbar, upd_app, init_user} from "../actions/actionCreator";
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';

import rest from "./Rest";

const WebSocketAdapter = props => {

  const notifyMe = text => {

    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
      return false;
    }

    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
      // If it's okay let's create a notification
      return new Notification(text);
    }

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        // If the user accepts, let's create a notification
        return permission === "granted" ?
          new Notification(text) : false;

      });
    }

    return false;
    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them any more.
  }

  useEffect(() => {

    const {jwt, upd_app} = props;

    rest('initial')
      .then(res => upd_app(res.body))

    try {

      let ws = new WebSocket('wss://appblog.ru:3333/' + jwt);
      // let ws = new WebSocket('ws://localhost:3333/'  + jwt);

      ws.onmessage = response => {

        if (!response.isTrusted) return true;

        let data = decodeURIComponent(response.data);
        try {
          data = JSON.parse(data);
          if (typeof (data) !== "object") throw('Error');

          // console.log(data)

          if (data.type === undefined) {

            upd_app(data);

          } else if (data.type === "notification") {

            if (!notifyMe(data.text)) {

              props.enqueueSnackbar({
                message: data.text,
                options: {
                  variant: 'success',
                  // autoHideDuration: 1000,
                },
              });

            }

          } else if (data.type === 'check_zp') {
          } else if (data.type === 'testConnection') {
            ws.send('test')
          }

        } catch {

        }


      };

      // ws.onclose = () => {
      //     console.log('onclose');
      // };

      // rest('initial', 'PUT')
      //     .then(res => upd_app(res.body))

    } catch (e) {
      // console.error("ws " + e)
    }


  }, [])

  return null;

}

const mapDispatchToProps = dispatch => bindActionCreators({
  enqueueSnackbar,
  upd_app
}, dispatch);

export default connect(state => state.auth, mapDispatchToProps)(WebSocketAdapter);
