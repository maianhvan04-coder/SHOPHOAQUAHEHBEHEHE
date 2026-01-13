import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getFeedbacksByProductAPI,
  getProductRatingSummaryAPI,
  createFeedbackAPI,
  updateFeedbackAPI,
  checkFeedbackByOrderAndProductAPI,
} from "../../api/feedback.api";

/**
 * Lấy feedback theo product
 */
export const fetchFeedbacksByProduct = createAsyncThunk(
  "feedback/fetchByProduct",
  async ({ productId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const res = await getFeedbacksByProductAPI(productId, page, limit);
      return res.data.DT;
    } catch (err) {
      return rejectWithValue(err.response?.data?.EM || "Lỗi tải feedback");
    }
  }
);

/**
 * Lấy rating summary
 */
export const fetchProductRatingSummary = createAsyncThunk(
  "feedback/fetchRatingSummary",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await getProductRatingSummaryAPI(productId);
      return res.data.DT;
    } catch (err) {
      return rejectWithValue(err.response?.data?.EM || "Lỗi tải rating");
    }
  }
);

/**
 * Tạo feedback
 */
export const createFeedback = createAsyncThunk(
  "feedback/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createFeedbackAPI(data);
      return res.data.DT;
    } catch (err) {
      return rejectWithValue(err.response?.data?.EM || "Không thể tạo đánh giá");
    }
  }
);

/**
 * Cập nhật feedback
 */
export const updateFeedback = createAsyncThunk(
  "feedback/update",
  async ({ feedbackId, data }, { rejectWithValue }) => {
    try {
      const res = await updateFeedbackAPI(feedbackId, data);
      return res.data.DT;
    } catch (err) {
      return rejectWithValue(err.response?.data?.EM || "Không thể cập nhật đánh giá");
    }
  }
);

/**
 * Check feedback theo order + product
 */
export const checkFeedbackByOrderAndProduct = createAsyncThunk(
  "feedback/check",
  async ({ orderId, productId }, { rejectWithValue }) => {
    try {
      const res = await checkFeedbackByOrderAndProductAPI(orderId, productId);
      
      return res.data.DT; 
    } catch (err) {
      return rejectWithValue(err.response?.data?.EM || "Không thể kiểm tra feedback");
    }
  }
);
