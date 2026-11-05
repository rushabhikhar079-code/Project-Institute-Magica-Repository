import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import App from "./app/App";
import { store, persistor } from "./app/redux/store";

import "./styles/index.css";
import { injectStore } from "./app/services/api";

injectStore(store);
createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
);
