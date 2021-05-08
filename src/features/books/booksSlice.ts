import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Book, DbBook } from './schema';

type BookState = { entities: Book[] };
const initialState: BookState = { entities: [] };

export const booksSlice = createSlice({
  name: 'books',
  initialState: initialState,
  reducers: {
    bookAdd: (state, action: PayloadAction<DbBook>) => {
      const book = {
        ...action.payload,
        id: 'dummyid',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state.entities.push(book);
    },
  },
});

export const { bookAdd } = booksSlice.actions;
export default booksSlice.reducer;
