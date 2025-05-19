import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import huiReducer from './huiSlice'
import memberReducer from './memberSlice'

// Cấu hình Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    hui: huiReducer,
    member: memberReducer,
  },
  // Thêm middleware nếu cần
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})
