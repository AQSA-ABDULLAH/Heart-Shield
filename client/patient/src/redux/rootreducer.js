import { combineReducers } from 'redux';
import authReducer from './containers/auth/reducers';

const rootReducer = combineReducers({
    auth: authReducer,
   
});

export default rootReducer;
