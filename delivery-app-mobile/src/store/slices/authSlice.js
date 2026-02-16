import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../api/services/authService';
import storage from '../../utils/storage';
import { USER_TYPES } from '../../utils/constants';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ phone, email, password, userType }, { rejectWithValue }) => {
    try {
      const response = await authService.login(phone, email, password, userType);
      const data = response.data;
      // Backend: { token, refreshToken, user: { id, type, name } }
      const token = data.token;
      const refreshToken = data.refreshToken ?? data.refresh_token;
      const user = data.user ? { ...data.user, user_type: data.user.type || userType } : null;

      await storage.setAuthToken(token);
      if (refreshToken) await storage.setRefreshToken(refreshToken);
      await storage.setUserData(user);
      await storage.setUserType(user?.user_type);
      return { token, refresh_token: refreshToken, user };
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ userType, registrationData }, { rejectWithValue }) => {
    try {
      const response = await authService.register(userType, registrationData);
      const data = response.data;
      // Backend: { token, user } (no refreshToken on register)
      const token = data.token;
      const refreshToken = data.refreshToken ?? data.refresh_token;
      const user = data.user ? { ...data.user, user_type: data.user.type || userType } : null;

      await storage.setAuthToken(token);
      if (refreshToken) await storage.setRefreshToken(refreshToken);
      await storage.setUserData(user);
      await storage.setUserType(user?.user_type);
      return { token, refresh_token: refreshToken, user };
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      await storage.clearAuthData();
      return null;
    } catch (error) {
      // Clear local storage even if API call fails
      await storage.clearAuthData();
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refresh_token = await storage.getRefreshToken();
      if (!refresh_token) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken(refresh_token);
      const { token } = response.data;

      await storage.setAuthToken(token);
      return token;
    } catch (error) {
      await storage.clearAuthData();
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

export const loadUserFromStorage = createAsyncThunk(
  'auth/loadUserFromStorage',
  async (_, { rejectWithValue }) => {
    try {
      const [token, userData, userType] = await Promise.all([
        storage.getAuthToken(),
        storage.getUserData(),
        storage.getUserType(),
      ]);

      if (token && userData) {
        return { token, user: userData, userType };
      }
      return null;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load user data');
    }
  }
);

export const switchRole = createAsyncThunk(
  'auth/switchRole',
  async (targetType, { rejectWithValue }) => {
    try {
      const response = await authService.switchRole(targetType);
      const data = response.data;
      const token = data.token;
      const refreshToken = data.refreshToken ?? data.refresh_token;
      const user = data.user ? { ...data.user, user_type: data.user.type || targetType } : null;

      await storage.setAuthToken(token);
      if (refreshToken) await storage.setRefreshToken(refreshToken);
      await storage.setUserData(user);
      await storage.setUserType(user?.user_type);
      return { token, refresh_token: refreshToken, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to switch role';
      const code = error.response?.data?.code;
      return rejectWithValue({ message, code });
    }
  }
);

export const switchBranch = createAsyncThunk(
  'auth/switchBranch',
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await authService.switchBranch(branchId);
      const data = response.data;
      const token = data.token;
      const refreshToken = data.refreshToken ?? data.refresh_token;
      const user = data.user ? { ...data.user, user_type: data.user.type } : null;

      await storage.setAuthToken(token);
      if (refreshToken) await storage.setRefreshToken(refreshToken);
      await storage.setUserData(user);
      await storage.setUserType(user?.user_type);
      return { token, refresh_token: refreshToken, user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to switch branch');
    }
  }
);

// Initial state
const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  userType: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refresh_token;
        state.userType = action.payload.user?.user_type ?? action.payload.user?.type;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refresh_token;
        state.userType = action.payload.user?.user_type ?? action.payload.user?.type;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.userType = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Still clear auth state even on error
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.userType = null;
        state.isAuthenticated = false;
      })

      // Refresh token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.userType = null;
        state.isAuthenticated = false;
      })

      // Load user from storage
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.userType = action.payload.userType;
          state.isAuthenticated = true;
        }
      })

      // Switch Role
      .addCase(switchRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(switchRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refresh_token;
        state.userType = action.payload.user?.user_type ?? action.payload.user?.type;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(switchRole.rejected, (state, action) => {
        state.isLoading = false;
        // Don't log out on switch rejection, just show error
        state.error = action.payload?.message || action.payload;
      })

      // Switch Branch
      .addCase(switchBranch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(switchBranch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refresh_token;
        state.userType = action.payload.user?.user_type ?? action.payload.user?.type;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(switchBranch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setUser, updateUser } = authSlice.actions;
export default authSlice.reducer;
