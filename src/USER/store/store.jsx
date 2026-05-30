// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice';
import authReducer from './slices/authSlice';
import wishListReducer from './slices/wishListSlice';
import cartReducer from './slices/cartSlice';

const store = configureStore({
  reducer: {
    products: productsReducer,
    auth: authReducer,
    wish: wishListReducer,
    cart: cartReducer,
  },
});

export default store;
