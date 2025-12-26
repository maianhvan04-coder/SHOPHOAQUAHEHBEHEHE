import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addToCartAPI,
  deleteFromCartAPI,
  getCartAPI,
  updateQuantityCartAPI,
} from "../../api/user.api";

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCartAPI();

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi tải giỏ hàng"
      );
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await addToCartAPI(productId, quantity);
      
      if (response.success) {
    
        const cartRes = await getCartAPI(); 
        return cartRes.data;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi");
    }
  }
);
export const updateCartQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await updateQuantityCartAPI(productId, quantity);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.message || "Lỗi cập nhật");
    }
  }
);

// Thunk cho Delete
export const deleteItemFromCart = createAsyncThunk(
  "cart/deleteItem",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await deleteFromCartAPI(productId);
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.message || "Lỗi khi xóa");
    }
  }
);
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
    updatingItemId: null,
    isLoading: false,
    isAdding: false,
    error: null,
  },
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        
        state.isLoading = false;
        state.items = action.payload.items;
        state.totalAmount = action.payload.totalAmount;
        state.totalQuantity = action.payload.totalQuantity;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(addToCart.pending, (state, action) => {
        state.isAdding = true;
        const { productId, quantity, productData } = action.meta.arg;

        // TÌM XEM SẢN PHẨM ĐÃ CÓ TRONG GIỎ CHƯA
        const existingItem = state.items.find(
          (item) => item.product?._id === productId
        );

        if (existingItem) {
          // Nếu có rồi thì cộng dồn số lượng
          existingItem.quantity += quantity;
          existingItem.subTotal =
            existingItem.quantity * existingItem.product.price;
        } else if (productData) {
          // Nếu chưa có (và bạn truyền productData từ Component lên), thêm mới vào mảng items
          state.items.push({
            product: productData,
            quantity: quantity,
            subTotal: productData.price * quantity,
          });
        }

        
        state.totalQuantity += quantity;
        if (productData || existingItem) {
          const price = existingItem
            ? existingItem.product.price
            : productData.price;
          state.totalAmount += price * quantity;
        }
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isAdding = false;
     
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isAdding = false;
        state.error = action.payload;
      })
      .addCase(updateCartQuantity.pending, (state, action) => {
        const { productId, quantity } = action.meta.arg;
        state.updatingItemId = productId; 

        const itemIndex = state.items.findIndex(
          (item) => item.product?._id === productId
        );
        if (itemIndex !== -1) {
          const item = state.items[itemIndex];
          const oldQuantity = item.quantity;
          const diff = quantity - oldQuantity;

          // Cập nhật giá trị mới ngay lập tức
          item.quantity = quantity;
          item.subTotal = item.product.price * quantity;

          // Cập nhật tổng giỏ hàng
          state.totalAmount += diff * item.product.price;
          state.totalQuantity += diff;
        }
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.updatingItemId = null;
        if (action.payload) {
          state.items = action.payload.items;
          state.totalAmount = action.payload.totalAmount;
          state.totalQuantity = action.payload.totalQuantity;
        }
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.updatingItemId = null;
        state.error = action.payload;
      })
      .addCase(deleteItemFromCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteItemFromCart.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload) {
          state.items = action.payload.items;
          state.totalQuantity = action.payload.totalQuantity;
          state.totalAmount = action.payload.totalAmount;
        }
      })
      .addCase(deleteItemFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});
export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
