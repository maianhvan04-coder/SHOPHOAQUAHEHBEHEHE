import { configureStore } from "@reduxjs/toolkit";
import productReducer from "../../features/product/product_slice";
import categoryReducer from "../../features/category/category.store";
export const store = configureStore({
  reducer: {
    product: productReducer,
    category: categoryReducer,
  },
});
