import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import GlobalAxios from '../../../../Global/GlobalAxios';

// Define an async thunk for fetching products
export const fetchProductsThunk = createAsyncThunk(
  'cart/fetchProducts',
  async () => {
    const response = await GlobalAxios.get('/products');
    return response.data.data;
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default productsSlice.reducer;
