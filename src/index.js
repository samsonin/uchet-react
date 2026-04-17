import React from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App';
import {BrowserRouter} from 'react-router-dom';
import {Provider} from 'react-redux';
import store from './store';
import {SnackbarProvider} from 'notistack';

import "./index.css";

import Circularln from './components/CircularIndeterminate';

// import registerServiceWorker from './registerServiceWorker';


const root = createRoot(document.getElementById('root'));

try {

    root.render(<Provider store={store} className={'d-print-none'}>
            <BrowserRouter>
                <div id="circularln"
                     style={{display: 'none'}}
                >
                    <Circularln/>
                </div>
                <SnackbarProvider>
                    <App/>
                </SnackbarProvider>
            </BrowserRouter>
        </Provider>
    );

} catch (e) {

    console.error(e)

    window.location.href = '/'

}

// registerServiceWorker();
