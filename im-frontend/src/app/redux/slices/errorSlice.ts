import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ErrorState {
  message: string | null;
  status: number | null;
  errors: string[];
}

const initialState: ErrorState = {
  message: null,
  status: null,
  errors: [],
};

const errorSlice = createSlice({
  name: "error",
  initialState,
  reducers: {
    setGlobalError: (
      state,
      action: PayloadAction<{
        message?: string;
        status?: number;
        errors?: string[];
      }>,
    ) => {
      const message = action.payload.message ?? null;

      state.message = message;
      state.status = action.payload.status ?? null;

      const errorList = action.payload.errors?.length
        ? action.payload.errors
        : message
          ? [message]
          : [];

      state.errors = errorList
        .flatMap((error) =>
          error
            .split(/\r?\n|\\r?\\n/)
            .map((item) => item.replace(/^-\s*/, "").trim()),
        )
        .filter((error) => error && error !== "Failed Exports:");
    },

    clearGlobalError: (state) => {
      state.message = null;
      state.status = null;
      state.errors = [];
    },
  },
});

export const { setGlobalError, clearGlobalError } = errorSlice.actions;

export default errorSlice.reducer;
