import { combineReducers } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage'; // uses localStorage
import { persistReducer } from 'redux-persist';
import loaderReducer from './loader.reducers';
import sessionReducer from './session.reducer'
import userReducer from './user.reducers'
import caseReducer from './cases.reducer';
import snackbar from './snackbar';
import chatReducer from './chat.reducer';
import voiceMailReducer from './voicemail.reducers';
import callLogsReducer from './callLogs.reducers';
import callerReducer from './caller.reducers';
import postCallReducer from './postcall.reducers';

const rootReducer = combineReducers({
  voiceMailReducer,
  sessionReducer,
  userReducer,
  caseReducer,
  loaderReducer,
  callerReducer,
  snackbar,
  chatReducer,
  callLogsReducer,
  postCallReducer
});
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['sessionReducer', 'userReducer','caseReducer','loaderReducer','snackbar', 'chatReducer' , 'voiceMailReducer','callLogsReducer', 'callerReducer','postCallReducer'] // reducers you want to persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export default persistedReducer;

