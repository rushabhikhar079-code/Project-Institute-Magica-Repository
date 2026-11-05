import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Loader from "./components/common/Loader";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { loadIpLocation } from "./redux/slices/locationSlice";
import { useEffect } from "react";
import GlobalError from "./components/common/GlobalError";
export default function App() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.loader.activeRequests > 0);
  useEffect(() => {
    dispatch(loadIpLocation());
  }, [dispatch]);
  return (
    <>
      {loading && <Loader />}

      <RouterProvider router={router} />
      <GlobalError />

      <ToastContainer
        position="top-right"
        autoClose={6000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}
