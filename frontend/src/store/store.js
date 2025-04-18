import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import popupSlice from './slices/popUpSlice';
import userReducer from './slices/userSlice';
import bookReducer from './slices/bookSlice';
import borrowReducer from './slices/borrowSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    popup: popupSlice,
    user: userReducer,
    book: bookReducer,
    borrow: borrowReducer,
  },
});
