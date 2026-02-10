import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../../api/services/cartService';

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ menuItemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartService.addItem(menuItemId, quantity);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add item to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ cartItemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartService.updateItem(cartItemId, quantity);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update cart item');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (cartItemId, { rejectWithValue }) => {
    try {
      await cartService.removeItem(cartItemId);
      return cartItemId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to remove item from cart');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await cartService.clearCart();
      return null;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to clear cart');
    }
  }
);

// Initial state
const initialState = {
  cart: null,
  items: [],
  restaurantId: null,
  restaurantName: null,
  subtotal: 0,
  isLoading: false,
  error: null,
};

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartState: (state) => {
      state.cart = null;
      state.items = [];
      state.restaurantId = null;
      state.restaurantName = null;
      state.subtotal = 0;
      state.error = null;
    },
    calculateSubtotal: (state) => {
      state.subtotal = state.items.reduce((total, item) => {
        return total + item.menu_item.price * item.quantity;
      }, 0);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload.cart;
        state.items = action.payload.items || [];
        state.restaurantId = action.payload.restaurant_id;
        state.restaurantName = action.payload.restaurant_name;
        state.subtotal = action.payload.subtotal || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload.cart;
        state.items = action.payload.items || [];
        state.restaurantId = action.payload.restaurant_id;
        state.restaurantName = action.payload.restaurant_name;
        state.subtotal = action.payload.subtotal || 0;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update cart item
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.subtotal = action.payload.subtotal || 0;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Remove from cart
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter(item => item.cart_item_id !== action.payload);
        state.subtotal = state.items.reduce((total, item) => {
          return total + item.menu_item.price * item.quantity;
        }, 0);
        
        // Clear cart if no items
        if (state.items.length === 0) {
          state.cart = null;
          state.restaurantId = null;
          state.restaurantName = null;
        }
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Clear cart
      .addCase(clearCart.fulfilled, (state) => {
        state.cart = null;
        state.items = [];
        state.restaurantId = null;
        state.restaurantName = null;
        state.subtotal = 0;
        state.error = null;
      });
  },
});

export const { clearCartState, calculateSubtotal } = cartSlice.actions;
export default cartSlice.reducer;
