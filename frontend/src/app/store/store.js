import { configureStore } from "@reduxjs/toolkit";
import productReducer from "../../features/product/product_slice";
import categoryReducer from "../../features/category/category.store";
import cartReducer from "../../features/cart/cart.slice";
import orderReducer from "../../features/order/order.slice";
import wishlistReducer from "../../features/wishlist/wishlist.slice";
import feedbackReducer from "../../features/feedback/feedback.slice";
export const store = configureStore({
  reducer: {
    product: productReducer,
    category: categoryReducer,
    cart: cartReducer,
    order: orderReducer,
    wishlist: wishlistReducer,
    feedback: feedbackReducer,
  },
});
