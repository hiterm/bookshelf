import React, { useRef } from 'react';
import { db, firebase } from '../Firebase';

export const BookImportPage: React.FC<{}> = () => {
  const fileInput = useRef() as React.MutableRefObject<HTMLInputElement>;

  const batchDb = (list: { title: string; author: string; date: string }[]) => {
    const batch = db.batch();
    for (let i = 0; i < list.length; i++) {
      const book = list[i];

      const tmp = book.date.split('年');
      const year = Number.parseInt(tmp[0]);
      const tmp2 = tmp[1].split('月');
      const month = Number.parseInt(tmp2[0]);
      const date = Number.parseInt(tmp2[1].split('日')[0]);

      const formattedBook = {
        title: book.title,
        authors: [book.author],
        format: 'eBook',
        store: 'Kindle',
        createdAt: new Date(year, month, date),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      var newBookRef = db.collection('books').doc();
      batch.set(newBookRef, formattedBook);
    }
    batch
      .commit()
      .then(() => console.log('successed to save'))
      .catch((error) => console.log(error));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const files = fileInput.current?.files;
    if (files === null) {
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
      const json = JSON.parse(reader.result);
      batchDb(json);
      console.log('saved to firestore.');
    };
    reader.onabort = () => {
      console.log('file reading was aborted');
    };
    reader.onerror = () => {
      console.log('failed to read file.');
    };
    reader.readAsText(file);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" ref={fileInput} />
      <button type="submit">Submit</button>
    </form>
  );
};
