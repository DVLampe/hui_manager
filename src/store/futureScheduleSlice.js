'use client';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  schedules: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Async thunk to fetch future payment schedules for the logged-in user
export const fetchFutureSchedules = createAsyncThunk(
  'futureSchedule/fetchFutureSchedules',
  async (_, { rejectWithValue, getState }) => {
    // const { userId } = getState().auth.user; // Assuming user info is in auth slice
    // If your API can infer user from token, you might not need to send userId explicitly
    try {
      const response = await axios.get('/api/future-schedule'); // API endpoint to be created
      return response.data; // Expecting an array of schedule items
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch future schedules');
    }
  }
);

const futureScheduleSlice = createSlice({
  name: 'futureSchedule',
  initialState,
  reducers: {
    resetFutureSchedules: (state) => {
      state.schedules = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFutureSchedules.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFutureSchedules.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.schedules = action.payload;
      })
      .addCase(fetchFutureSchedules.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetFutureSchedules } = futureScheduleSlice.actions;
export default futureScheduleSlice.reducer;
