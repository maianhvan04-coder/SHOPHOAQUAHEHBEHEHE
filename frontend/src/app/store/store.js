import { configureStore } from "@reduxjs/toolkit";
import productReducer from "../../features/product/product_slice";
import categoryReducer from "../../features/category/category.store";
import cartReducer from "../../features/cart/cart.slice";
export const store = configureStore({
  reducer: {
    product: productReducer,
    category: categoryReducer,
    cart: cartReducer
  },
});
