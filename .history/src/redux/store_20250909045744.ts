import { Environments } from '@/constants/enums';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './features/cart/cartSlice';
import cartReducer from './featuresظ/order/orderslice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
        order: orderReducer
  },
  devTools: process.env.NODE_ENV === Environments.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
