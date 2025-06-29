import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import huiReducer from './huiSlice'
import memberReducer from './memberSlice'
import paymentReducer from './paymentSlice'
import futureScheduleReducer from './futureScheduleSlice' // Added import

// Cấu hình Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    hui: huiReducer,
    member: memberReducer,
    payments: paymentReducer,
    futureSchedule: futureScheduleReducer, // Added reducer
  },
  // Thêm middleware nếu cần
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})
