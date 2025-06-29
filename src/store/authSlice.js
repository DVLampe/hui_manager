import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: 'idle',
  error: null,
  registrationSuccess: false,
};

// Async thunk for user registration
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Registration failed');
    }
  }
);

// Async thunk for user login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Login failed');
    }
  }
);

// Async thunk to check auth status by calling /api/auth/me
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/auth/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Not authenticated');
    }
  }
);

// Async thunk for user logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post('/api/auth/logout');
      return;
    } catch (error) {
      console.error('Logout API call failed:', error.response?.data?.error);
      return rejectWithValue(error.response?.data?.error || 'Logout failed on server');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload ? 'pending' : 'idle';
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = 'failed';
    },
    clearError: (state) => {
      state.error = null;
    },
    resetRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = 'succeeded';
        state.registrationSuccess = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
        state.registrationSuccess = false;
      })
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem('huiUser', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem('huiUser');
      })
      // Check Auth Status
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem('huiUser', JSON.stringify(action.payload.user));
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload === 'Not authenticated' ? null : action.payload;
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem('huiUser');
      })
      // Logout User
      .addCase(logoutUser.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = 'succeeded';
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        localStorage.removeItem('huiUser');
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = 'failed';
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
        localStorage.removeItem('huiUser');
        console.warn('Client-side logout executed despite server logout failure.');
      });
  }
});

export const { setLoading, setError, clearError, resetRegistrationSuccess } = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectRegistrationSuccess = (state) => state.auth.registrationSuccess;

export default authSlice.reducer;
