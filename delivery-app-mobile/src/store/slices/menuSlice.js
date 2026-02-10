import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { menuService } from '../../api/services/menuService';

// Async thunks
export const fetchMenu = createAsyncThunk(
  'menu/fetchMenu',
  async (restaurantId, { rejectWithValue }) => {
    try {
      const response = await menuService.getMenuByRestaurant(restaurantId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch menu');
    }
  }
);

export const fetchMenuItemById = createAsyncThunk(
  'menu/fetchMenuItemById',
  async (menuItemId, { rejectWithValue }) => {
    try {
      const response = await menuService.getMenuItemById(menuItemId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch menu item');
    }
  }
);

// Initial state
const initialState = {
  menu: [],
  menuItems: [],
  selectedMenuItem: null,
  categories: [],
  isLoading: false,
  error: null,
  restaurantId: null,
};

// Menu slice
const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setSelectedMenuItem: (state, action) => {
      state.selectedMenuItem = action.payload;
    },
    clearSelectedMenuItem: (state) => {
      state.selectedMenuItem = null;
    },
    setCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch menu
      .addCase(fetchMenu.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMenu.fulfilled, (state, action) => {
        state.isLoading = false;
        state.menu = action.payload.menu || [];
        state.menuItems = action.payload.items || [];
        state.categories = action.payload.categories || [];
        state.restaurantId = action.payload.restaurant_id;
      })
      .addCase(fetchMenu.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch menu item by ID
      .addCase(fetchMenuItemById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMenuItemById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedMenuItem = action.payload.menu_item;
      })
      .addCase(fetchMenuItemById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedMenuItem, clearSelectedMenuItem, setCategory } = menuSlice.actions;
export default menuSlice.reducer;
