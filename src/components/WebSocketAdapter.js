import React, {useEffect} from "react";
import {upd_app} from "../actions/actionCreator";
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';

import {useSnackbar} from 'notistack';

import Button from "@mui/material/Button";
import rest from "./Rest";
import { IS_LOCALHOST } from "../constants";

const mapDispatchToProps = dispatch => bindActionCreators({upd_app}, dispatch);

export default connect(state => state.auth, mapDispatchToProps)(({jwt, upd_app}) => {

    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {

        if (!jwt) return

        rest('initial')

        const configuredUrl = process.env.REACT_APP_WS_URL;
        const wsBaseUrl = configuredUrl || (IS_LOCALHOST ? '' : `wss://${window.location.hostname}:3333`);

        if (!wsBaseUrl) return

        try {

            const ws = new WebSocket(wsBaseUrl + '/' + jwt);

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
                if (process.env.NODE_ENV !== 'production') {
                    console.log('WebSocket error', e)
                }

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

                if (['/daily', '/transit'].includes(window.location.pathname)){
                    rest('upd')
                }

            }
            window.onblur = () => sendIsFocus(false);

            sendIsFocus(true)

            return () => {
                window.onfocus = null
                window.onblur = null
                ws.close()
            }

        } catch (e) {
            // console.error("ws " + e)
        }

        // eslint-disable-next-line
    }, [jwt])

    return null;

})
