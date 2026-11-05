import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type EnquiryState = {
  studentId: number | null;
};

const initialState: EnquiryState = {
  studentId: null,
};

const enquirySlice = createSlice({
  name: "enquiry",
  initialState,
  reducers: {
    setStudentId: (state, action: PayloadAction<number>) => {
      state.studentId = action.payload;
    },
    clearStudentId: (state) => {
      state.studentId = null;
    },
  },
});

export const { setStudentId, clearStudentId } = enquirySlice.actions;

export default enquirySlice.reducer;
