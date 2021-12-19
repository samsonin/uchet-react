import {UPD_APP} from "../constants";
import {EXIT_APP} from "../constants";

let initialState = {
    balance: 0,
    stocks: [],
    users: [],
    organization: [],
    config: [],
    docs: [],
    fields: [],
    providers: [],
    categories: [],
}

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

                if (k === 'entities') {

                    newState.providers = action.data[k]

                } else if (k === 'order') {

                    if (newState.orders) {

                        let prevOrder = newState.orders
                            .find(o => o.id === action.data.order.id && o.stock_id === action.data.order.stock_id)

                        if (prevOrder) prevOrder = action.data.order
                        else newState.orders.push(action.data.order)

                    } else {

                        newState.orders = [action.data.order]

                    }

                } else {

                    newState[k] = action.data[k]

                }

                return k;
            });

        }

        window.localStorage.setItem('app', JSON.stringify(newState));
        return newState;

    } else if (action.type === EXIT_APP) {

        window.localStorage.removeItem('app');
        return initialState

    } else {
        return state
    }

};

export default app;
