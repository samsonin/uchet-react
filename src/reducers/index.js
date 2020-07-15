import { combineReducers } from 'redux';
import auth from "./auth";
import app from "./app";
import notif from "./nitifier";

const rootReducer = combineReducers({ auth, app, notif });

export default rootReducer;