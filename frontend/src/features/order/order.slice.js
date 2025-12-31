import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createOrderAPI,
  getMyOrdersAPI,
  getOrderDetailAPI,
  cancelOrderAPI,
  updateOrderStatusAPI,
  getAllOrdersAPI,
} from "../../api/order.api";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const createNewOrder = createAsyncThunk(
  "order/create",
  async (orderData, { rejectWithValue }) => {
    try {
      await delay(3000);
      const response = await createOrderAPI(orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.message || `Đặt hàng thất bại ${error}`
      );
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  "order/fetchMyOrders",
  async (status, { rejectWithValue }) => {
    try {
      const response = await getMyOrdersAPI(status);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi lấy danh sách"
      );
    }
  }
);

export const fetchOrderDetail = createAsyncThunk(
  "order/fetchOrderDetail",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await getOrderDetailAPI(orderId);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không tìm thấy đơn hàng"
      );
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "order/cancelOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await cancelOrderAPI(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Hủy đơn hàng thất bại"
      );
    }
  }
);
export const fetchAllOrdersAdmin = createAsyncThunk(
  "order/fetchAllOrdersAdmin",
  async (query, { rejectWithValue }) => {
    try {
      const response = await getAllOrdersAPI(query);
      
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi lấy toàn bộ danh sách"
      );
    }
  }
);

export const updateStatusAdmin = createAsyncThunk(
  "order/updateStatusAdmin",
  async ({ orderId, statusData }, { rejectWithValue }) => {
    try {
      const response = await updateOrderStatusAPI(orderId, statusData);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Cập nhật thất bại"
      );
    }
  }
);
const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [],
    currentOrder: null,
    isLoading: false,
    isSuccess: false,
    errorMessage: null,
  },
  reducers: {
    resetOrderState: (state) => {
      state.isSuccess = false;
      state.isLoading = false;
      state.errorMessage = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        state.currentOrder = action.payload.data;

        state.orders.unshift(action.payload.data);
      })

      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })

      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log(action.payload.data);
        state.currentOrder = action.payload.data;
      })

      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedOrder = action.payload;

        const index = state.orders.findIndex((o) => o._id === updatedOrder._id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }

        if (state.currentOrder && state.currentOrder._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }
      })
      .addCase(fetchAllOrdersAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.totalItems = action.payload.totalItems;
      })

      .addCase(updateStatusAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedOrder = action.payload.data;

        const index = state.orders.findIndex((o) => o._id === updatedOrder._id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }

        if (state.currentOrder && state.currentOrder._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }
      })
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.isLoading = true;
          state.errorMessage = null;
        }
      )

      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.isLoading = false;
          state.errorMessage = action.payload;
        }
      );
  },
});

export const { resetOrderState, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
