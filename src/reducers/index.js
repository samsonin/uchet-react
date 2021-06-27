import { combineReducers } from 'redux'
import auth from "./auth"
import app from "./app"
import scan from "./scan"
import notif from "./nitifier"

const rootReducer = combineReducers({ auth, app, notif, scan });

export default rootReducer;