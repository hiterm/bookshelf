import React, { useState, useEffect } from 'react';
import { db } from './Firebase';

type Book = {
  title: string;
};

function isBook(obj: any): obj is Book {
  return obj.title !== undefined;
}

const BookList: React.FC<{ list: Book[] }> = (props) => (
  <ul>
    {props.list.map((book) => (
      <li>{book.title}</li>
    ))}
  </ul>
);

const Form: React.FC<{}> = (props) => {
  const [formTitle, setFormTitle] = useState('');
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormTitle(event.target.value);
  };
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    db.collection('books').add({
      title: formTitle,
    });
  };

  return (
    <form>
      <label>
        Title:
        <input type="text" name="title" onChange={handleChange} />
      </label>
      <button onClick={handleClick}>Add</button>
    </form>
  );
};

export const BookshelfApp: React.FC<{}> = () => {
  const [list, setList] = useState([] as Book[]);

  useEffect(() => {
    const unsubscribe = db.collection('books').onSnapshot((querySnapshot) => {
      const list = querySnapshot.docs.map((doc) => doc.data());
      const filteredList = list
        .map((data) => {
          if (!isBook(data)) {
            console.log(`data is not "Book" object: ${data}`);
            return null;
          }
          return data;
        })
        .filter((data): data is Book => data !== null);
      setList(filteredList);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <React.Fragment>
      <Form />
      <BookList list={list} />
    </React.Fragment>
  );
};
