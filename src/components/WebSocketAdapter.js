import React, {useEffect} from "react";
import {upd_app} from "../actions/actionCreator";
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';

import {useSnackbar} from 'notistack';

import Button from "@material-ui/core/Button";
import rest from "./Rest";

const mapDispatchToProps = dispatch => bindActionCreators({upd_app}, dispatch);

export default connect(state => state.auth, mapDispatchToProps)(({jwt, upd_app}) => {

    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {

        if (!jwt) return

        rest('initial')

        try {

            const ws = new WebSocket('wss://appblog.ru:3333/' + jwt);
            // const ws = new WebSocket('ws://localhost:3333/'  + jwt);

            ws.onmessage = response => {

                if (!response.isTrusted) return true;

                let data = decodeURIComponent(response.data);
                try {
                    data = JSON.parse(data);

                    if (typeof (data) !== "object") throw(console.error());

                    if (data.type === undefined) {

                        upd_app(data);

                    } else if (data.type === "notification") {

                        enqueueSnackbar(data.text, {
                            variant: 'success',
                        });

                    } else if (data.type === "incoming_call_order" && data.order_id && data.stock_id) {

                        const url = document.location.protocol + '//' + document.location.host
                            + '/order/' + data.stock_id + '/' + data.order_id

                        const action = () => <Button onClick={() => {
                            window.open(url, "_blank")
                        }}>
                            Открыть
                        </Button>

                        enqueueSnackbar('Входящий звонок по заказу ' + data.order_id, {
                            variant: 'success',
                            autoHideDuration: 5000,
                            action,
                        });

                    } else if (data.type === 'testConnection') {
                        ws.send('test')
                    }

                } catch {

                }


            };

            ws.onerror = e => {

                console.log('error', e)

            }

            // ws.onclose = () => {
            //     console.log('onclose');
            // };

            // rest('initial', 'PUT')

            const sendIsFocus = isFocus => {
                if (ws && ws.readyState === ws.OPEN) {
                    ws.send(JSON.stringify({
                        isFocus,
                        pathname: window.location.pathname
                    }))
                }
            }

            window.onfocus = () => {

                sendIsFocus(true);

                if (['daily', 'transit'].includes(window.location.pathname)){
                    rest('upd')
                }

            }
            window.onblur = () => sendIsFocus(false);

            sendIsFocus(true)

        } catch (e) {
            // console.error("ws " + e)
        }

        // eslint-disable-next-line
    }, [jwt])

    return null;

})