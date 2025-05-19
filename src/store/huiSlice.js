import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk để fetch hui groups
export const fetchHuis = createAsyncThunk(
  'hui/fetchHuis',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/hui');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch hui groups');
    }
  }
);

// Async thunk để tạo hụi mới
export const createHui = createAsyncThunk(
  'hui/createHui',
  async (huiData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/hui', huiData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create hui group');
    }
  }
);

// Async thunk để fetch một hụi theo ID
export const fetchHuiById = createAsyncThunk(
  'hui/fetchHuiById',
  async (huiId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/hui/${huiId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch hui details');
    }
  }
);

const initialState = {
  huis: [],
  loading: false, // For fetching list
  error: null,    // For fetching list
  createHuiLoading: false,
  createHuiError: null,
  createHuiSuccess: false,
  selectedHui: null,
  status: 'idle', // for selectedHui: 'idle' | 'loading' | 'succeeded' | 'failed'
  // selectedHuiLoading: false, // Replaced by status
  // selectedHuiError: null, // Replaced by error (can be reused or specific one)
};

// Slice quản lý state hụi
const huiSlice = createSlice({
  name: 'hui',
  initialState,
  reducers: {
    clearHuiError: (state) => {
      state.error = null;
    },
    resetCreateHuiStatus: (state) => {
      state.createHuiLoading = false;
      state.createHuiError = null;
      state.createHuiSuccess = false;
    },
    resetSelectedHui: (state) => {
      state.selectedHui = null;
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Huis
      .addCase(fetchHuis.pending, (state) => {
        state.loading = true; // For list
        state.error = null;
      })
      .addCase(fetchHuis.fulfilled, (state, action) => {
        state.loading = false; // For list
        state.huis = action.payload;
        state.error = null;
      })
      .addCase(fetchHuis.rejected, (state, action) => {
        state.loading = false; // For list
        state.error = action.payload;
        state.huis = [];
      })
      // Create Hui
      .addCase(createHui.pending, (state) => {
        state.createHuiLoading = true;
        state.createHuiError = null;
        state.createHuiSuccess = false;
      })
      .addCase(createHui.fulfilled, (state, action) => {
        state.createHuiLoading = false;
        state.huis = [action.payload, ...state.huis]; 
        state.createHuiSuccess = true;
        state.createHuiError = null;
      })
      .addCase(createHui.rejected, (state, action) => {
        state.createHuiLoading = false;
        state.createHuiError = action.payload;
        state.createHuiSuccess = false;
      })
      // Fetch Hui By Id
      .addCase(fetchHuiById.pending, (state) => {
        state.status = 'loading';
        state.selectedHui = null; // Clear previous one
        state.error = null;
      })
      .addCase(fetchHuiById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedHui = action.payload;
        state.error = null;
      })
      .addCase(fetchHuiById.rejected, (state, action) => {
        state.status = 'failed';
        state.selectedHui = null;
        state.error = action.payload;
      });
  },
});

export const { clearHuiError, resetCreateHuiStatus, resetSelectedHui } = huiSlice.actions;
export default huiSlice.reducer;