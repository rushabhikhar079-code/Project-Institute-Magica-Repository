import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface EnquiryDraftState {
  studentId: number | null;
}

const initialState: EnquiryDraftState = {
  studentId: null,
};

const enquiryDraftSlice = createSlice({
  name: "enquiryDraft",
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

export const { setStudentId, clearStudentId } = enquiryDraftSlice.actions;

export default enquiryDraftSlice.reducer;
