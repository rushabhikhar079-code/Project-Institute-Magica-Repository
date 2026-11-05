// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// interface AuthState {
//   instituteId: number;
//   role: string;
//   branchId: number;
// }

// const initialState: AuthState = {
//   instituteId: Number(localStorage.getItem("instituteId")) || 0,
//   role: localStorage.getItem("role") || "",
//   branchId: Number(localStorage.getItem("branchId")) || 0,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setAuthData: (
//       state,
//       action: PayloadAction<{
//         instituteId: number;
//         role: string;
//         branchId?: number;
//       }>,
//     ) => {
//       state.instituteId = action.payload.instituteId ?? 0;
//       state.role = action.payload.role ?? "";
//       state.branchId = action.payload.branchId ?? 0;

//       // Sync to localStorage
//       localStorage.setItem("instituteId", state.instituteId.toString());
//       localStorage.setItem("role", state.role);
//       localStorage.setItem("branchId", state.branchId.toString());
//     },
//     logout: (state) => {
//       state.instituteId = 0;
//       state.role = "";
//       state.branchId = 0;

//       // Clear local storage
//       localStorage.removeItem("instituteId");
//       localStorage.removeItem("role");
//       localStorage.removeItem("branchId");
//     },
//   },
// });

// export const { setAuthData, logout } = authSlice.actions;
// export default authSlice.reducer;
// authSlice.ts
// authSlice.ts
import { createSlice, PayloadAction, UnknownAction } from "@reduxjs/toolkit";

interface AuthState {
  instituteId: number;
  role: string;
  branchId: number;
}

const initialState: AuthState = {
  instituteId: Number(localStorage.getItem("instituteId")) || 0,
  role: localStorage.getItem("role") || "",
  branchId: Number(localStorage.getItem("branchId")) || 0,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthData: (
      state,
      action: PayloadAction<{
        instituteId: number;
        role: string;
        branchId?: number;
      }>,
    ) => {
      state.instituteId = action.payload.instituteId ?? 0;
      state.role = action.payload.role ?? "";
      state.branchId = action.payload.branchId ?? 0;

      localStorage.setItem("instituteId", state.instituteId.toString());
      localStorage.setItem("role", state.role);
      localStorage.setItem("branchId", state.branchId.toString());
    },

    setAuthBranchId: (state, action: PayloadAction<number>) => {
      state.branchId = action.payload;
      localStorage.setItem("branchId", action.payload.toString());
    },

    logout: (state) => {
      state.instituteId = 0;
      state.role = "";
      state.branchId = 0;

      localStorage.removeItem("instituteId");
      localStorage.removeItem("role");
      localStorage.removeItem("branchId");
    },
  },
  extraReducers: (builder) => {
    // ✅ Matches string action type accurately with proper PayloadAction typing
    builder.addMatcher(
      (action: UnknownAction): action is PayloadAction<number> =>
        action.type === "branch/setBranchId",
      (state, action) => {
        state.branchId = action.payload;
        localStorage.setItem("branchId", action.payload.toString());
      },
    );
  },
});

export const { setAuthData, setAuthBranchId, logout } = authSlice.actions;
export default authSlice.reducer;
