// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// interface BranchState {
//   instituteId: number;
//   branchId: number;
// }

// const initialState: BranchState = {
//   instituteId: 0,
//   branchId: 0,
// };

// const branchSlice = createSlice({
//   name: "branch",
//   initialState,
//   reducers: {
//     setInstituteId: (state, action: PayloadAction<number>) => {
//       state.instituteId = action.payload;
//     },

//     setBranchId: (state, action: PayloadAction<number>) => {
//       state.branchId = action.payload;
//     },

//     resetBranchState: (state) => {
//       state.instituteId = 0;
//       state.branchId = 0;
//     },
//   },
// });

// export const { setInstituteId, setBranchId, resetBranchState } =
//   branchSlice.actions;

// export default branchSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface BranchItem {
  branchId: number;
  branchName: string;
}

export interface BranchLocation {
  countryId: number;
  stateId: number;
  cityId: number;
  otherCity?: string;
}

interface BranchState {
  instituteId: number;
  branchId: number;
  branches: BranchItem[];
  branchLocation: BranchLocation | null;
}
const initialState: BranchState = {
  instituteId: 0,
  branchId: 0,
  branches: [],
  branchLocation: null,
};

const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {
    setInstituteId: (state, action: PayloadAction<number>) => {
      state.instituteId = action.payload;
    },

    setBranchId: (state, action: PayloadAction<number>) => {
      state.branchId = action.payload;
    },

    setBranchList: (state, action: PayloadAction<BranchItem[]>) => {
      state.branches = action.payload;
    },
    setBranchLocation: (
      state,
      action: PayloadAction<BranchLocation | null>,
    ) => {
      state.branchLocation = action.payload;
    },
    resetBranchState: (state) => {
      state.branchId = 0;
      state.branchLocation = null;
    },
  },
});

export const {
  setInstituteId,
  setBranchId,
  setBranchList,
  setBranchLocation,
  resetBranchState,
} = branchSlice.actions;

export default branchSlice.reducer;
