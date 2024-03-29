import {CLOSE_GOOD, DELETE_GOOD, UPD_APP} from "../constants";
import {EXIT_APP} from "../constants";

let initialState = {
    balance: 0,
    stocks: [],
    users: [],
    orders: [],
    organization: [],
    config: [],
    docs: [],
    fields: [],
    providers: [],
    categories: [],
}

const probableKeys = [
    'balance',
    'current_stock_id',
    'good',
    'positions',
    'stocks',
    'users',
    'stockusers',
    'organization',
    'config',
    'fields',
    'need_callbacks',
    'docs',
    'entities',
    'providers',
    'categories',
    'order',
    'orders',
    'referals',
    'statuses',
    'queue',
    'daily',
    'transit',
    'zp',
]


const getItems = () => {

    const items = JSON.parse(window.localStorage.getItem('app'))

    if (!items) return null

    delete items.orders

    return items

}

const app = (state = getItems() || initialState, action) => {

    if (action.type === UPD_APP) {

        let newState = {...state}

        if (typeof (action.data) === 'object') {

            Object.keys(action.data).map(k => {

                if (!probableKeys.includes(k)) return k

                if (k === 'entities') k = 'providers'

                if (k === 'order') {

                    if (newState.orders) {

                        const nextOrders = newState.orders
                            .filter(o => !(o.id === action.data.order.id && o.stock_id === action.data.order.stock_id))

                        nextOrders.push(action.data.order)

                        newState.orders = nextOrders

                    } else {

                        newState.orders = [action.data.order]

                    }

                } else {

                    if (k === 'good' && window.location.pathname === '/transit') {

                        return k

                    }

                    newState[k] = action.data[k]

                }

                return k;
            });

        }

        const newStorage = {...newState}
        delete newStorage.good

        // window.localStorage.setItem('app', JSON.stringify(newStorage));

        return newState;

    } else if (action.type === EXIT_APP) {

        window.localStorage.removeItem('app');
        return initialState

    } else if (action.type === CLOSE_GOOD) {

        let newState = {...state}
        delete newState.good
        return newState;

    } else if (action.type === DELETE_GOOD) {

        let newState = {...state}

        if (action.barcode) newState.needDeleteBarcode = action.barcode
        else delete newState.needDeleteBarcode

        return newState

    } else {
        return state
    }

}

export default app;