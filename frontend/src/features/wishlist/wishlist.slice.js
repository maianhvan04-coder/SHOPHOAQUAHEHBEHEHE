import { createSlice } from "@reduxjs/toolkit";
import { message } from "antd";


const loadWishlistFromStorage = () => {
  try {
    const savedWishlist = localStorage.getItem("joygreen_wishlist");
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  } catch (error) {
    return [];
  }
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: loadWishlistFromStorage(),
    isLoading: false,
  },
  reducers: {

    toggleWishlistLocal: (state, action) => {
      const productId = action.payload;
      const index = state.items.indexOf(productId);

      if (index === -1) {
       
        state.items.push(productId);
        message.success("Đã thêm vào mục yêu thích!");
      } else {
       
        state.items.splice(index, 1);
        message.info("Đã xóa khỏi mục yêu thích.");
      }

    
      localStorage.setItem("joygreen_wishlist", JSON.stringify(state.items));
    },
    
  
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem("joygreen_wishlist");
    }
  }
});

export const { toggleWishlistLocal, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;