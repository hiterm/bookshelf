import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Book, BookFormProps } from './schema';

const booksAdapter = createEntityAdapter<Book>({
  selectId: (book) => book.id,
});

export const booksSlice = createSlice({
  name: 'books',
  initialState: booksAdapter.getInitialState(),
  reducers: {
    bookAdd: (state, action: PayloadAction<BookFormProps>) => {
      const book = {
        ...action.payload,
        id: action.payload.title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      booksAdapter.addOne(state, book);
    },
  },
});

export const { bookAdd } = booksSlice.actions;
export default booksSlice.reducer;
