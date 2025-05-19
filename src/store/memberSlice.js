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

const initialState = {
  members: [],
  loading: false,
  error: null
}

const memberSlice = createSlice({
  name: 'member',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
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
  }
})

export const { clearError } = memberSlice.actions
export default memberSlice.reducer
