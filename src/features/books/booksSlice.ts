import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Book, DbBook } from './schema';

const booksAdapter = createEntityAdapter<Book>({
  selectId: (book) => book.id,
});

export const booksSlice = createSlice({
  name: 'books',
  initialState: booksAdapter.getInitialState(),
  reducers: {
    bookAdd: (state, action: PayloadAction<DbBook>) => {
      const book = {
        ...action.payload,
        id: action.payload.title,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      booksAdapter.addOne(state, book);
    },
  },
});

export const { bookAdd } = booksSlice.actions;
export default booksSlice.reducer;
