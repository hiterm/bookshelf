import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import booksReducer from './features/books/booksSlice';

const store = configureStore({
  reducer: { books: booksReducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export default store;
