import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import loaderReducer from "./slices/loaderSlice";
import menuReducer from "./slices/menuSlice";
import authReducer from "./slices/authSlice";
import branchReducer from "./slices/branchSlice";
import locationReducer from "./slices/locationSlice";
import errorReducer from "./slices/errorSlice";

const branchPersistConfig = {
  key: "branch",
  storage,
};

const rootReducer = combineReducers({
  loader: loaderReducer,
  menu: menuReducer,
  auth: authReducer,
  branch: persistReducer(branchPersistConfig, branchReducer),
  location: locationReducer,
  error: errorReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PAUSE",
          "persist/PURGE",
          "persist/REGISTER",
          "persist/FLUSH",
        ],
      },
    }),
});

export const persistor = persistStore(store);

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
