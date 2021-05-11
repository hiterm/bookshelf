import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Book, BookFormProps } from './schema';

const booksAdapter = createEntityAdapter<Book>({
  selectId: (book) => book.id,
});

type Loading = 'not loaded' | 'loading' | 'loaded';

export const booksSlice = createSlice({
  name: 'books',
  initialState: booksAdapter.getInitialState({
    loading: 'not loaded' as Loading,
  }),
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
    booksReplaceAll: (state, action: PayloadAction<Book[]>) => {
      booksAdapter.removeAll(state);
      booksAdapter.addMany(state, action.payload);
    },
  },
});

export const { bookAdd, booksReplaceAll } = booksSlice.actions;
export default booksSlice.reducer;
