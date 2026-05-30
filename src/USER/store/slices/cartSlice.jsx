import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import GlobalAxios from '../../../../Global/GlobalAxios';
import Cookies from 'js-cookie';



// Fetch cart items from the backend

export const fetchCartItems = createAsyncThunk(
  'cart/fetchCartItems',
  async () => {
    const response = await GlobalAxios.get('/cart');
    return response.data.data.carts || []; // Ensure it returns an array
  }
);

// Remove cart item from the backend and state
export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await GlobalAxios.delete(`/cart/${itemId}`);
      return response.data; // Returning the id so we can remove it from the state
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);



const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    addCartItem: (state, action) => {
      state.items.push(action.payload);
    },
    upDateCartItem: (state, action) => {
      state.items = state.items.map((item) =>
        item.id === action.payload.id ? { ...item, ...action.payload } : item
      );
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.error = action.payload || 'Failed to remove the item';
      });
  }
});

export const { addCartItem,removeCart,upDateCartItem } = cartSlice.actions;
export default cartSlice.reducer;
