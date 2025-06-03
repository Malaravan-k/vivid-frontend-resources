import { combineReducers } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage'; // uses localStorage
import { persistReducer } from 'redux-persist';
import loaderReducer from './loader.reducers';
import sessionReducer from './session.reducer'
import userReducer from './user.reducers'
import caseReducer from './cases.reducer';

const rootReducer = combineReducers({

  sessionReducer,
  userReducer,
  caseReducer,
  loaderReducer
});
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['sessionReducer', 'userReducer','caseReducer','loaderReducer'] // reducers you want to persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export default persistedReducer;
