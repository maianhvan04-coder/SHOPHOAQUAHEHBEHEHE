import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllProductsAPI,
  getProductBySlugAPI,
  getTopNewProductsAPI,
} from "../../api/public_api/product.api";

export const fetchProductsForUser = createAsyncThunk(
  "product/fetchProductsForUser",
  async (filters, { rejectWithValue }) => {
    try {
  
      const response = await getAllProductsAPI(filters);
      if (response && response.EC === 0) {
        return response.DT;
      } else {
        return rejectWithValue(response.EM);
      }
    } catch (error) {
      return rejectWithValue(error.message || "Không thể kết nối đến Server");
    }
  }
);
export const fetchProductDetailBySlug = createAsyncThunk(
  "product/fetchProductDetailBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await getProductBySlugAPI(slug);
      if (response && response.EC === 0) {
        return response.DT;
      } else {
        return rejectWithValue(response.EM);
      }
    } catch (error) {
      return rejectWithValue(error.message || "Lỗi khi lấy chi tiết sản phẩm");
    }
  }
);
export const fetchTopNewProducts = createAsyncThunk(
  "product/fetchTopNewProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getTopNewProductsAPI();
      if (response && response.EC === 0) {
        return response.DT; // Mảng 4 sản phẩm
      } else {
        return rejectWithValue(response.EM);
      }
    } catch (error) {
      return rejectWithValue(error.message || "Lỗi khi lấy danh sách bán chạy");
    }
  }
);
const productSlice = createSlice({
  name: "product",
  initialState: {
    listProducts: [],
    listTopNew: [],
    totalItems: 0,
    currentProduct: null,
    currentPage: 1,
    totalPages:1,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearProductList: (state) => {
      state.listProducts = [];
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchProductsForUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(fetchProductsForUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listProducts = action.payload.products;
        state.totalItems = action.payload.totalItems;
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })

      .addCase(fetchProductsForUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductDetailBySlug.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.currentProduct = null;
      })
      .addCase(fetchProductDetailBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductDetailBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchTopNewProducts.pending, (state) => {
        state.isLoading = true; 
      })
      .addCase(fetchTopNewProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listTopNew = action.payload; 
      })
      .addCase(fetchTopNewProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProductList, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
