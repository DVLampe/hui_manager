import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Async thunk for fetching payments
export const fetchPayments = createAsyncThunk(
  'payments/fetchPayments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/payments')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch payments')
    }
  }
)

// Async thunk for creating a payment
export const createPayment = createAsyncThunk(
  'payments/createPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      // Converting huiId to groupId if it exists for backward compatibility
      if (paymentData.huiId && !paymentData.groupId) {
        paymentData.groupId = paymentData.huiId
        delete paymentData.huiId
      }
      
      const response = await axios.post('/api/payments', paymentData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create payment')
    }
  }
)

// Async thunk for updating a payment
export const updatePayment = createAsyncThunk(
  'payments/updatePayment',
  async ({ id, paymentData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/payments/${id}`, paymentData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update payment')
    }
  }
)

// Async thunk for deleting a payment
export const deletePayment = createAsyncThunk(
  'payments/deletePayment',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/payments/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete payment')
    }
  }
)

const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  createStatus: 'idle',
  createError: null,
  updateStatus: 'idle',
  updateError: null,
  deleteStatus: 'idle',
  deleteError: null
}

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearPaymentErrors: (state) => {
      state.error = null
      state.createError = null
      state.updateError = null
      state.deleteError = null
    },
    resetCreateStatus: (state) => {
      state.createStatus = 'idle'
      state.createError = null
    },
    resetUpdateStatus: (state) => {
      state.updateStatus = 'idle'
      state.updateError = null
    },
    resetDeleteStatus: (state) => {
      state.deleteStatus = 'idle'
      state.deleteError = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Payments
      .addCase(fetchPayments.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      
      // Create Payment
      .addCase(createPayment.pending, (state) => {
        state.createStatus = 'loading'
        state.createError = null
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.createStatus = 'succeeded'
        state.items.unshift(action.payload) // Add to the beginning of the array
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.createStatus = 'failed'
        state.createError = action.payload
      })
      
      // Update Payment
      .addCase(updatePayment.pending, (state) => {
        state.updateStatus = 'loading'
        state.updateError = null
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded'
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.updateStatus = 'failed'
        state.updateError = action.payload
      })
      
      // Delete Payment
      .addCase(deletePayment.pending, (state) => {
        state.deleteStatus = 'loading'
        state.deleteError = null
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.deleteStatus = 'succeeded'
        state.items = state.items.filter(item => item.id !== action.payload)
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.deleteStatus = 'failed'
        state.deleteError = action.payload
      })
  }
})

export const { 
  clearPaymentErrors, 
  resetCreateStatus, 
  resetUpdateStatus, 
  resetDeleteStatus 
} = paymentSlice.actions

export default paymentSlice.reducer
