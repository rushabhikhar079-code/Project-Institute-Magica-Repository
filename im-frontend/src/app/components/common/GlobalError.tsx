import { useEffect } from "react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { clearGlobalError } from "../../redux/slices/errorSlice";

const GlobalError = () => {
  const dispatch = useAppDispatch();

  const { message, status } = useAppSelector((state) => state.error);

  useEffect(() => {
    if (!message) return;

    toast.error(message, {
      toastId: `global-error-${status ?? "unknown"}-${message}`,
    });
    dispatch(clearGlobalError());
  }, [message, status, dispatch]);

  return null;
};

export default GlobalError;
