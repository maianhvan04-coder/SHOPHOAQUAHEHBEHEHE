import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAllCategoriesAPI } from "../../api/public_api/category.api";

export const fetchAllCategories = createAsyncThunk(
  "category/fetchAllCategories",
  async (_, thunkAPI) => {
    try {
    
      const response = await getAllCategoriesAPI({ limit: 100 }); 
    
      return response.DT.categories; 
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Lỗi");
    }
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState: {
    listCategories: [],
    isLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listCategories = action.payload;
      })
      .addCase(fetchAllCategories.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default categorySlice.reducer;