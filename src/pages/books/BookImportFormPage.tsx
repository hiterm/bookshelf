import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useRef } from 'react';
import { db, firebase } from '../../Firebase';
import { OldBookBaseType } from '../../features/books/schema';
import { BookImportType } from './BookImportConfirmPage';

const batchDb = (list: { title: string; author: string; date: string }[]) => {
  const batch = db.batch();
  for (let i = 0; i < list.length; i++) {
    const book = list[i];

    dayjs.extend(customParseFormat);
    const date = dayjs(book.date, 'YYYY年M月D日');

    const formattedBookPart: OldBookBaseType = {
      title: book.title,
      authors: [book.author],
      format: 'eBook',
      store: 'Kindle',
      owned: true,
      read: false,
      priority: 50,
    };

    const formattedBook = {
      ...formattedBookPart,
      createdAt: date.toDate(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    const newBookRef = db.collection('books').doc();
    batch.set(newBookRef, formattedBook);
  }
  batch
    .commit()
    .then(() => console.log('successed to save'))
    .catch((error) => console.log(error));
};

type BookImportFormPageProps = {
  books: BookImportType[];
  setResult: React.Dispatch<React.SetStateAction<BookImportType[]>>;
};

export const BookImportFormPage: React.FC<BookImportFormPageProps> = ({
  books,
  setResult,
}) => {
  const fileInput = useRef<HTMLInputElement>(null);

  const handleChange = () => {
    const files = fileInput.current?.files;
    if (files === null || files === undefined) {
      console.log('failed to get file.');
      return;
    }
    const file = files[0];

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        console.log(`type of result is ${typeof reader.result}`);
        return;
      }
      // TODO: 型チェック
      const json = JSON.parse(reader.result);
      setResult(json);
    };
    reader.onabort = () => {
      console.log('file reading was aborted');
    };
    reader.onerror = () => {
      console.log('failed to read file.');
    };
    reader.readAsText(file);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    batchDb(books);
    console.log('saved to firestore.');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" ref={fileInput} onChange={handleChange} />
      <button type="submit">Submit</button>
    </form>
  );
};
