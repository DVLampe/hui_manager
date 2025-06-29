import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Async thunk để fetch members
export const fetchMembers = createAsyncThunk(
  'member/fetchMembers',
  async (huiId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/hui/${huiId}/members`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

// Async thunk để tạo member mới
export const createMember = createAsyncThunk(
  'member/createMember',
  async (memberData, { rejectWithValue }) => {
    try {
      // The memberData should already be in the correct format: { userId, groupId, ...otherOptionalFields }
      // No transformation is needed if the dispatch sends the correct keys.
      const response = await axios.post('/api/members', memberData); 
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create member');
    }
  }
);

const initialState = {
  members: [],
  loading: false,
  error: null,
  createStatus: 'idle',
  createError: null
}

const memberSlice = createSlice({
  name: 'member',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetCreateStatus: (state) => {
      state.createStatus = 'idle'
      state.createError = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Members
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false
        state.members = action.payload
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create Member
      .addCase(createMember.pending, (state) => {
        state.createStatus = 'loading'
        state.createError = null
      })
      .addCase(createMember.fulfilled, (state, action) => {
        state.createStatus = 'succeeded'
        state.members.push(action.payload) // Add new member to array
      })
      .addCase(createMember.rejected, (state, action) => {
        state.createStatus = 'failed'
        state.createError = action.payload
      })
  }
})

export const { clearError, resetCreateStatus } = memberSlice.actions
export default memberSlice.reducer
