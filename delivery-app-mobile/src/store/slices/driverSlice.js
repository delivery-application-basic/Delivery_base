import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { driverService } from '../../api/services/driverService';

// Async thunks
export const fetchAvailableOrders = createAsyncThunk(
  'driver/fetchAvailableOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await driverService.getAvailableOrders();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch available orders');
    }
  }
);

export const acceptOrder = createAsyncThunk(
  'driver/acceptOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await driverService.acceptOrder(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to accept order');
    }
  }
);

export const rejectOrder = createAsyncThunk(
  'driver/rejectOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await driverService.rejectOrder(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to reject order');
    }
  }
);

export const updateDriverAvailability = createAsyncThunk(
  'driver/updateAvailability',
  async (isAvailable, { rejectWithValue }) => {
    try {
      const response = await driverService.updateAvailability(isAvailable);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update availability');
    }
  }
);

export const fetchDriverEarnings = createAsyncThunk(
  'driver/fetchEarnings',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await driverService.getEarnings(startDate, endDate);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch earnings');
    }
  }
);

// Initial state
const initialState = {
  availableOrders: [],
  activeDelivery: null,
  isAvailable: true,
  earnings: null,
  isLoading: false,
  error: null,
};

// Driver slice
const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    setActiveDelivery: (state, action) => {
      state.activeDelivery = action.payload;
    },
    clearActiveDelivery: (state) => {
      state.activeDelivery = null;
    },
    setAvailability: (state, action) => {
      state.isAvailable = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch available orders
      .addCase(fetchAvailableOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAvailableOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availableOrders = action.payload.orders || [];
      })
      .addCase(fetchAvailableOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Accept order
      .addCase(acceptOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(acceptOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeDelivery = action.payload.order;
        // Remove from available orders
        state.availableOrders = state.availableOrders.filter(
          order => order.order_id !== action.payload.order.order_id
        );
      })
      .addCase(acceptOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Reject order
      .addCase(rejectOrder.fulfilled, (state, action) => {
        // Remove from available orders
        state.availableOrders = state.availableOrders.filter(
          order => order.order_id !== action.payload.order_id
        );
      })
      
      // Update availability
      .addCase(updateDriverAvailability.fulfilled, (state, action) => {
        state.isAvailable = action.payload.is_available;
      })
      
      // Fetch earnings
      .addCase(fetchDriverEarnings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDriverEarnings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.earnings = action.payload;
      })
      .addCase(fetchDriverEarnings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setActiveDelivery, clearActiveDelivery, setAvailability } = driverSlice.actions;
export default driverSlice.reducer;
