import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useRef } from 'react';
import { db, firebase } from '../../Firebase';
import { BookImportConfirmPage } from './BookImportConfirmPage';

export const BookImportPage: React.FC<{}> = () => {
  return <BookImportConfirmPage />;
  // const fileInput = useRef() as React.MutableRefObject<HTMLInputElement>;

  // const batchDb = (list: { title: string; author: string; date: string }[]) => {
  //   const batch = db.batch();
  //   for (let i = 0; i < list.length; i++) {
  //     const book = list[i];

  //     dayjs.extend(customParseFormat);
  //     const date = dayjs(book.date, 'YYYY年M月D日');

  //     const formattedBook = {
  //       title: book.title,
  //       authors: [book.author],
  //       format: 'eBook',
  //       store: 'Kindle',
  //       owned: true,
  //       createdAt: date.toDate(),
  //       updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  //     };
  //     const newBookRef = db.collection('books').doc();
  //     batch.set(newBookRef, formattedBook);
  //   }
  //   batch
  //     .commit()
  //     .then(() => console.log('successed to save'))
  //     .catch((error) => console.log(error));
  // };

  // const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();

  //   const files = fileInput.current?.files;
  //   if (files === null) {
  //     console.log('failed to get file.');
  //     return;
  //   }
  //   const file = files[0];

  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     if (typeof reader.result !== 'string') {
  //       console.log(`type of result is ${typeof reader.result}`);
  //       return;
  //     }
  //     const json = JSON.parse(reader.result);
  //     batchDb(json);
  //     console.log('saved to firestore.');
  //   };
  //   reader.onabort = () => {
  //     console.log('file reading was aborted');
  //   };
  //   reader.onerror = () => {
  //     console.log('failed to read file.');
  //   };
  //   reader.readAsText(file);
  // };

  // return (
  //   <form onSubmit={handleSubmit}>
  //     <input type="file" ref={fileInput} />
  //     <button type="submit">Submit</button>
  //   </form>
  // );
};
