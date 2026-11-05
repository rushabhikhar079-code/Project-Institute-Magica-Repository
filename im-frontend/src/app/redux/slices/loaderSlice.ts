import { createSlice } from "@reduxjs/toolkit";

interface LoaderState {
  activeRequests: number;
}

const initialState: LoaderState = {
  activeRequests: 0,
};

const loaderSlice = createSlice({
  name: "loader",
  initialState,
  reducers: {
    showLoader: (state) => {
      state.activeRequests += 1;
    },
    hideLoader: (state) => {
      state.activeRequests = Math.max(0, state.activeRequests - 1);
    },
    resetLoader: (state) => {
      state.activeRequests = 0;
    },
  },
});

export const { showLoader, hideLoader, resetLoader } = loaderSlice.actions;

export default loaderSlice.reducer;
