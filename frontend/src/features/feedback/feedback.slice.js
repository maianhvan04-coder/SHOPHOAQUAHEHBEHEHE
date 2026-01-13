import { createSlice } from "@reduxjs/toolkit";
import {
  fetchFeedbacksByProduct,
  fetchProductRatingSummary,
  createFeedback,
  updateFeedback,
  checkFeedbackByOrderAndProduct,
} from "./feedback.thunk";

const initialState = {
  feedbacks: [],
  total: 0,
  page: 1,
  totalPages: 0,

  ratingSummary: {
    averageRating: 0,
    totalReviews: 0,
  },

  orderFeedback: null, // feedback theo order + product

  loading: false,
  error: null,
};

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    resetOrderFeedback(state) {
      state.orderFeedback = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch feedbacks by product
      .addCase(fetchFeedbacksByProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbacksByProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbacks = action.payload.feedbacks;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchFeedbacksByProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // rating summary
      .addCase(fetchProductRatingSummary.fulfilled, (state, action) => {
        state.ratingSummary = action.payload;
      })

      // check feedback
      .addCase(checkFeedbackByOrderAndProduct.fulfilled, (state, action) => {
        state.orderFeedback = action.payload; // null hoặc feedback
      })

      // create feedback
      .addCase(createFeedback.fulfilled, (state, action) => {
        state.orderFeedback = action.payload;
      })

      // update feedback
      .addCase(updateFeedback.fulfilled, (state, action) => {
        state.orderFeedback = action.payload;

        const index = state.feedbacks.findIndex(
          (f) => f._id === action.payload._id
        );
        if (index !== -1) {
          state.feedbacks[index] = action.payload;
        }
      });
  },
});

export const { resetOrderFeedback } = feedbackSlice.actions;
export default feedbackSlice.reducer;
