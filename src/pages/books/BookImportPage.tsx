import React, { useState } from 'react';
import { BookImportConfirmPage, BookImportType } from './BookImportConfirmPage';
import { BookImportFormPage } from './BookImportFormPage';

export const BookImportPage: React.FC = () => {
  const [books, setBooks] = useState<BookImportType[]>([]);

  return (
    <>
      <BookImportFormPage setResult={setBooks} />
      <BookImportConfirmPage books={books} />
    </>
  );
};
