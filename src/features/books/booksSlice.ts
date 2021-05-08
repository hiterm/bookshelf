import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { Book } from './schema';

const booksAdapter = createEntityAdapter<Book>({
  selectId: (book) => book.id,
});

export const booksSlice = createSlice({
  name: 'books',
  initialState: booksAdapter.getInitialState(),
  reducers: {
    bookAdd: booksAdapter.addOne,
  },
});

export const { bookAdd } = booksSlice.actions;
export default booksSlice.reducer;
