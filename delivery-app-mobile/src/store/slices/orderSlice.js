import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../../api/services/orderService';

// Async thunks
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await orderService.createOrder(orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create order');
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async ({ filters = {}, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrders(filters, page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderById(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch order');
    }
  }
);

export const fetchOrderTracking = createAsyncThunk(
  'order/fetchOrderTracking',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderTracking(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch order tracking');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await orderService.cancelOrder(orderId, reason);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to cancel order');
    }
  }
);

// Initial state
const initialState = {
  orders: [],
  selectedOrder: null,
  orderTracking: null,
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  isLoading: false,
  error: null,
  filters: {
    status: null,
    dateFrom: null,
    dateTo: null,
  },
};

// Order slice
const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: null,
        dateFrom: null,
        dateTo: null,
      };
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find(o => o.order_id === orderId);
      if (order) {
        order.order_status = status;
      }
      if (state.selectedOrder?.order_id === orderId) {
        state.selectedOrder.order_status = status;
      }
    },
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
      state.orderTracking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        const order = action.payload.data ?? action.payload.order;
        state.isLoading = false;
        state.selectedOrder = order;
        if (order) state.orders.unshift(order);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        const p = action.payload;
        state.isLoading = false;
        state.orders = p.data ?? p.orders ?? [];
        state.currentPage = p.current_page ?? 1;
        state.totalPages = p.total_pages ?? 1;
        state.totalCount = p.total_count ?? p.count ?? 0;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        const p = action.payload;
        state.isLoading = false;
        state.selectedOrder = p.data ?? p.order;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch order tracking
      .addCase(fetchOrderTracking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderTracking.fulfilled, (state, action) => {
        const p = action.payload;
        state.isLoading = false;
        state.orderTracking = p.data ?? p;
      })
      .addCase(fetchOrderTracking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const order = action.payload.data ?? action.payload.order;
        state.isLoading = false;
        const id = order?.order_id;
        const o = state.orders.find((x) => x.order_id === id);
        if (o) o.order_status = 'cancelled';
        if (state.selectedOrder?.order_id === id) state.selectedOrder.order_status = 'cancelled';
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  updateOrderStatus,
  setSelectedOrder,
  clearSelectedOrder,
} = orderSlice.actions;
export default orderSlice.reducer;
