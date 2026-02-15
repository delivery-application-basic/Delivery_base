import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { restaurantService } from '../../api/services/restaurantService';

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Failed to fetch restaurants';
}

// Async thunks
export const fetchRestaurants = createAsyncThunk(
  'restaurant/fetchRestaurants',
  async ({ filters = {}, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await restaurantService.getRestaurants(filters, page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchRestaurantById = createAsyncThunk(
  'restaurant/fetchRestaurantById',
  async (restaurantId, { rejectWithValue }) => {
    try {
      const response = await restaurantService.getRestaurantById(restaurantId);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const searchRestaurants = createAsyncThunk(
  'restaurant/searchRestaurants',
  async ({ query, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await restaurantService.searchRestaurants(query, filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Initial state
const initialState = {
  restaurants: [],
  selectedRestaurant: null,
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  isLoading: false,
  error: null,
  filters: {
    cuisine: null,
    minRating: null,
    isOpen: null,
  },
  searchQuery: '',
};

// Restaurant slice
const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        cuisine: null,
        minRating: null,
        isOpen: null,
      };
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearSearchQuery: (state) => {
      state.searchQuery = '';
    },
    clearSelectedRestaurant: (state) => {
      state.selectedRestaurant = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch restaurants
      .addCase(fetchRestaurants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        const p = action.payload;
        state.isLoading = false;
        state.error = null;
        const raw = p?.restaurants ?? p?.data ?? p;
        state.restaurants = Array.isArray(raw) ? raw : [];
        state.currentPage = p?.current_page ?? 1;
        state.totalPages = p?.total_pages ?? 1;
        state.totalCount = p?.total_count ?? p?.count ?? state.restaurants.length;
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch restaurant by ID
      .addCase(fetchRestaurantById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantById.fulfilled, (state, action) => {
        const p = action.payload;
        state.isLoading = false;
        state.selectedRestaurant = p.restaurant ?? p.data;
      })
      .addCase(fetchRestaurantById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Search restaurants
      .addCase(searchRestaurants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchRestaurants.fulfilled, (state, action) => {
        const p = action.payload;
        state.isLoading = false;
        state.restaurants = p.restaurants ?? p.data ?? [];
        state.currentPage = p.current_page ?? 1;
        state.totalPages = p.total_pages ?? 1;
        state.totalCount = p.total_count ?? p.count ?? 0;
      })
      .addCase(searchRestaurants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setSearchQuery,
  clearSearchQuery,
  clearSelectedRestaurant,
} = restaurantSlice.actions;
export default restaurantSlice.reducer;
