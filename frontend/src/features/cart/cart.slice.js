import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const STORAGE_KEY = "cart";

const getCartFromStorage = () => {
  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    return data
      ? JSON.parse(data)
      : { items: [], totalQuantity: 0, totalAmount: 0 };
  } catch {
    return { items: [], totalQuantity: 0, totalAmount: 0 };
  }
};

const saveCartAndReturn = (cart) => {
  // Tính toán lại toàn bộ tổng số lượng và tổng tiền trước khi lưu
  cart.totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.totalAmount = cart.items.reduce((sum, item) => sum + item.subTotal, 0);

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  return cart;
};

// --- THUNKS ---

export const fetchCart = createAsyncThunk("cart/fetchCart", async () => {
  return getCartFromStorage();
});

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ product, quantity }, { rejectWithValue }) => {
    if (!product?._id) return rejectWithValue("Sản phẩm không hợp lệ");

    const cart = getCartFromStorage();
    const existingItem = cart.items.find((i) => i.product._id === product._id);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.subTotal =
        existingItem.quantity * existingItem.product.price;
    } else {
      cart.items.push({
        product,
        quantity,
        subTotal: product.price * quantity,
      });
    }

    return saveCartAndReturn(cart);
  }
);

export const updateCartQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({ productId, quantity }) => {
    const cart = getCartFromStorage();
    const item = cart.items.find((i) => i.product._id === productId);

    if (item && quantity > 0) {
      item.quantity = quantity;
      item.subTotal = item.product.price * quantity;
    }

    return saveCartAndReturn(cart);
  }
);

export const deleteItemFromCart = createAsyncThunk(
  "cart/deleteItem",
  async (productId) => {
    const cart = getCartFromStorage();
    cart.items = cart.items.filter((i) => i.product._id !== productId);
    return saveCartAndReturn(cart);
  }
);



const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.totalQuantity = 0;
      sessionStorage.removeItem(STORAGE_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      // Chỉ hiện loading khi fetch lần đầu cho chuyên nghiệp
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
      })
      // Xử lý chung cho tất cả action thành công
      .addMatcher(
        (action) =>
          action.type.startsWith("cart/") && action.type.endsWith("/fulfilled"),
        (state, action) => {
          state.isLoading = false;
          state.items = action.payload.items;
          state.totalAmount = action.payload.totalAmount;
          state.totalQuantity = action.payload.totalQuantity;
          state.error = null;
        }
      )
     
      .addMatcher(
        (action) =>
          action.type.startsWith("cart/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.isLoading = false;
          state.error =
            typeof action.payload === "string"
              ? action.payload
              : action.error?.message || "Lỗi thao tác giỏ hàng";
        }
      );
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
