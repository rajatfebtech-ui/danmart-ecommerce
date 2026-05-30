import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import GlobalAxios from "../../../../Global/GlobalAxios";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

// Fetch Wishlist Thunk
export const fetchWishlistThunk = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await GlobalAxios.get("/wishlist");
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Add to Wishlist Thunk
export const addWishlistThunk = createAsyncThunk(
  "wishlist/addWishlist",
  async (productId, { rejectWithValue }) => {
    console.log("Product ID Add to wishlist", productId);
    try {
      const response = await GlobalAxios.post("/wishlist", { product_id: productId });
      console.log(response.data.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Remove from Wishlist Thunk
export const removeWishlistThunk = createAsyncThunk(
  "wishlist/removeWishlist",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await GlobalAxios.delete(`/wishlist/${productId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const wishlistSlice = createSlice({
  name: "wish",
  initialState,
  extraReducers: (builder) => {
    builder
      // Handle fetch wishlist
      .addCase(fetchWishlistThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlistThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchWishlistThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch wishlist";
      })

      // Handle add to wishlist
      .addCase(addWishlistThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addWishlistThunk.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.loading = false;
      })
      .addCase(addWishlistThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add to wishlist";
      })

      // Handle remove from wishlist
      .addCase(removeWishlistThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeWishlistThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.product_id !== action.meta.arg);
        state.loading = false;
      })
      .addCase(removeWishlistThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to remove from wishlist";
      });
  },
});

export default wishlistSlice.reducer;