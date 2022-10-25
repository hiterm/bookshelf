import { Box, Button, Paper } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useUpdateBookMutation } from '../../generated/graphql';
import { useBookForm } from './BookForm';
import { Book, IBookForm } from './schema';

export const BookDetailEdit: React.FC<{ book: Book }> = (props) => {
  const book = props.book;

  const history = useHistory();

  const [_createBookResult, updateBook] = useUpdateBookMutation();

  const handleSubmit = async (values: IBookForm) => {
    const { authors, ...rest } = values;
    const bookData = {
      ...rest,
      authorIds: authors.map((author) => author.id),
    };
    await updateBook({ bookData: { id: book.id, ...bookData } });
    history.push(`/books/${book.id}`);
    showNotification({ message: '更新しました', color: 'teal' });
  };

  const { form, submitForm } = useBookForm({
    onSubmit: handleSubmit,
    initialValues: book,
  });

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <form onSubmit={submitForm}>
        <Paper
          sx={{
            padding: 5,
            minWidth: 400,
          }}
        >
          {form}
          <Button type="submit" mt="md">
            更新
          </Button>
        </Paper>
      </form>
    </Box>
  );
};
