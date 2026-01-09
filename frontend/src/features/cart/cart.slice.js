import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// 1. Import authStorage từ thư mục auth của team bạn
import { authStorage } from "~/features/auth/authStorage";
import {
  getCartAPI,
  addToCartAPI,
  updateQuantityAPI,
  deleteItemAPI,
  mergeCartAPI,
} from "../../api/cart.api";

const STORAGE_KEY = "cart";

// --- HELPERS GIỮ NGUYÊN ---
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
  cart.totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.totalAmount = cart.items.reduce((sum, item) => sum + item.subTotal, 0);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  return cart;
};

// --- THUNKS ---

// 2. Kiểm tra user bằng authStorage.getMe() trực tiếp trong mỗi Thunk
export const fetchCart = createAsyncThunk("cart/fetchCart", async () => {
  const user = authStorage.getMe()?.user; // Lấy từ storage y hệt ProfilePage

  if (user) {
    const res = await getCartAPI();
    return res.data.data;
  }
  return getCartFromStorage();
});

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ product, quantity }, { rejectWithValue }) => {
    if (!product?._id) return rejectWithValue("Sản phẩm không hợp lệ");

    const user = authStorage.getMe()?.user;
    if (user) {
      try {
        const res = await addToCartAPI({
          productId: product._id,
          quantity,
          price: product.price,
        });
        return res.data.data;
      } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Lỗi API");
      }
    }

    // Logic cho khách vãng lai
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
  async ({ productId, quantity }, { rejectWithValue }) => {
    const user = authStorage.getMe()?.user;
    if (user) {
      try {
        const res = await updateQuantityAPI({ productId, quantity });
        return res.data.data;
      } catch (err) {
        return rejectWithValue(err.response?.data?.message);
      }
    }

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
  async (productId, { rejectWithValue }) => {
    const user = authStorage.getMe()?.user;
    if (user) {
      try {
        const res = await deleteItemAPI(productId);
        return res.data.data;
      } catch (err) {
        return rejectWithValue(err.response?.data?.message);
      }
    }

    const cart = getCartFromStorage();
    cart.items = cart.items.filter((i) => i.product._id !== productId);
    return saveCartAndReturn(cart);
  }
);

export const mergeCartOnLogin = createAsyncThunk(
  "cart/mergeCart",
  async (_, { rejectWithValue }) => {
    try {
      const localCart = getCartFromStorage();
      if (localCart.items.length === 0) {
        const res = await getCartAPI();
        return res.data.data;
      }

      const itemsToMerge = localCart.items.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const res = await mergeCartAPI({ items: itemsToMerge });
      sessionStorage.removeItem(STORAGE_KEY);
      return res.data.data;
    } catch (err) {
      return rejectWithValue("Đồng bộ thất bại");
    }
  }
);

// --- SLICE GIỮ NGUYÊN MATCHERS ---
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
    updateQuantityLocal: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((i) => i.product?._id === productId);
      if (item) {
        item.quantity = quantity;
        item.subTotal = quantity * (item.product?.price || 0);
      }

      state.totalQuantity = state.items.reduce((sum, i) => sum + i.quantity, 0);
      state.totalAmount = state.items.reduce((sum, i) => sum + i.subTotal, 0);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
      })
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
          state.error = action.payload || "Lỗi thao tác";
        }
      );
  },
});

export const { clearCart, updateQuantityLocal } = cartSlice.actions;
export default cartSlice.reducer;
