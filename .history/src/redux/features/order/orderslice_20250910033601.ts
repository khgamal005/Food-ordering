// src/redux/features/order/orderSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface FormDataType {
  name: string;
  address: string;
  email: string;
  phone: string;
  // Add other fields as needed
}

interface CreateOrderPayload {
  formData: FormDataType;
  cart: CartIte[];
  paymentMethod: string;
}

export const createOrder = createAsyncThunk(
  "order/createOrder",
  async ({ formData, cart, paymentMethod }: CreateOrderPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/orders", {
        ...formData,
        cart,
        paymentMethod,
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || error.message);
      }
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

interface OrderState {
  loading: boolean;
  success: boolean;
  error: string | null;
  order: Record<string, unknown> | null;
}

const initialState: OrderState = {
  loading: false,
  success: false,
  error: null,
  order: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    resetOrder: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.order = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetOrder } = orderSlice.actions;
export default orderSlice.reducer;
