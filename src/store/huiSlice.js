import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Initial state
const initialState = {
  huis: [],
  loading: false,
  error: null,
  currentHui: null,
  createHuiLoading: false,
  createHuiError: null,
  createHuiSuccess: false,
  createdHuiData: null,
  fetchHuiByIdLoading: false,
  fetchHuiByIdError: null,
  updateHuiLoading: false,
  updateHuiError: null,
  updateHuiSuccess: false,
  deleteMemberLoading: false,
  deleteMemberError: null,
  deleteHuiLoading: false, // For deleting a hui
  deleteHuiError: null,   // For deleting a hui
  deleteHuiSuccess: false, // For deleting a hui
};

// Async thunk to fetch hui groups
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

// Async thunk to create a new hui
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

// Async thunk to fetch a hui by ID
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

// Async thunk to update a hui
export const updateHui = createAsyncThunk(
  'hui/updateHui',
  async (huiData, { rejectWithValue }) => {
    try {
      const { id, ...dataToUpdate } = huiData;
      const response = await axios.put(`/api/hui/${id}`, dataToUpdate);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update hui');
    }
  }
);

// Async thunk to delete a hui
export const deleteHui = createAsyncThunk(
  'hui/deleteHui',
  async (huiId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/hui/${huiId}`);
      return huiId; // Return the ID of the deleted hui
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete hui');
    }
  }
);

// Async thunk to delete a member from a hui
export const deleteHuiMember = createAsyncThunk(
  'hui/deleteHuiMember',
  async (memberId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/members/${memberId}`);
      return memberId; // Return the ID of the deleted member
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete member');
    }
  }
);

const huiSlice = createSlice({
  name: 'hui',
  initialState,
  reducers: {
    resetCreateHuiStatus: (state) => {
      state.createHuiLoading = false;
      state.createHuiError = null;
      state.createHuiSuccess = false;
      state.createdHuiData = null;
    },
    setCurrentHui: (state, action) => {
      state.currentHui = action.payload;
    },
    clearCurrentHui: (state) => {
      state.currentHui = null;
    },
    resetUpdateHuiStatus: (state) => {
      state.updateHuiLoading = false;
      state.updateHuiError = null;
      state.updateHuiSuccess = false;
    },
    resetDeleteMemberStatus: (state) => {
      state.deleteMemberLoading = false;
      state.deleteMemberError = null;
    },
    resetDeleteHuiStatus: (state) => {
      state.deleteHuiLoading = false;
      state.deleteHuiError = null;
      state.deleteHuiSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Huis
      .addCase(fetchHuis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHuis.fulfilled, (state, action) => {
        state.loading = false;
        state.huis = action.payload;
      })
      .addCase(fetchHuis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Hui
      .addCase(createHui.pending, (state) => {
        state.createHuiLoading = true;
        state.createHuiError = null;
        state.createHuiSuccess = false;
      })
      .addCase(createHui.fulfilled, (state, action) => {
        state.createHuiLoading = false;
        state.createHuiSuccess = true;
        state.createdHuiData = action.payload;
        if (action.payload) {
            state.huis.push(action.payload);
        }
      })
      .addCase(createHui.rejected, (state, action) => {
        state.createHuiLoading = false;
        state.createHuiError = action.payload;
      })
      // Fetch Hui by ID
      .addCase(fetchHuiById.pending, (state) => {
        state.fetchHuiByIdLoading = true;
        state.fetchHuiByIdError = null;
      })
      .addCase(fetchHuiById.fulfilled, (state, action) => {
        state.fetchHuiByIdLoading = false;
        state.currentHui = action.payload;
      })
      .addCase(fetchHuiById.rejected, (state, action) => {
        state.fetchHuiByIdLoading = false;
        state.fetchHuiByIdError = action.payload;
      })
      // Update Hui
      .addCase(updateHui.pending, (state) => {
        state.updateHuiLoading = true;
        state.updateHuiError = null;
        state.updateHuiSuccess = false;
      })
      .addCase(updateHui.fulfilled, (state, action) => {
        state.updateHuiLoading = false;
        state.updateHuiSuccess = true;
        state.currentHui = action.payload;
        const index = state.huis.findIndex(h => h.id === action.payload.id);
        if (index !== -1) {
          state.huis[index] = action.payload;
        }
      })
      .addCase(updateHui.rejected, (state, action) => {
        state.updateHuiLoading = false;
        state.updateHuiError = action.payload;
      })
      // Delete Hui
      .addCase(deleteHui.pending, (state) => {
        state.deleteHuiLoading = true;
        state.deleteHuiError = null;
        state.deleteHuiSuccess = false;
      })
      .addCase(deleteHui.fulfilled, (state, action) => {
        state.deleteHuiLoading = false;
        state.deleteHuiSuccess = true;
        state.huis = state.huis.filter(h => h.id !== action.payload);
        if (state.currentHui && state.currentHui.id === action.payload) {
          state.currentHui = null;
        }
      })
      .addCase(deleteHui.rejected, (state, action) => {
        state.deleteHuiLoading = false;
        state.deleteHuiError = action.payload;
      })
      // Delete Hui Member
      .addCase(deleteHuiMember.pending, (state) => {
        state.deleteMemberLoading = true;
        state.deleteMemberError = null;
      })
      .addCase(deleteHuiMember.fulfilled, (state, action) => {
        state.deleteMemberLoading = false;
        if (state.currentHui && state.currentHui.members) {
          state.currentHui.members = state.currentHui.members.filter(
            (member) => member.id !== action.payload
          );
        }
        if (state.currentHui) {
          const huiIndex = state.huis.findIndex(h => h.id === state.currentHui.id);
          if (huiIndex !== -1) {
            state.huis[huiIndex] = { ...state.currentHui };
          }
        }
      })
      .addCase(deleteHuiMember.rejected, (state, action) => {
        state.deleteMemberLoading = false;
        state.deleteMemberError = action.payload;
      });
  },
});

export const { 
  resetCreateHuiStatus, 
  setCurrentHui, 
  clearCurrentHui,
  resetUpdateHuiStatus,
  resetDeleteMemberStatus,
  resetDeleteHuiStatus // Export new action
} = huiSlice.actions;

export default huiSlice.reducer;
