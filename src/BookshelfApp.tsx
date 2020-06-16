import React, { useState } from 'react';

type Book = {
  title: string;
};

const BookList: React.FC<{ list: Book[] }> = (props) => (
  <ul>
    {props.list.map((book) => (
      <li>{book.title}</li>
    ))}
  </ul>
);

const Form: React.FC<{
  handleClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}> = (props) => {
  return (
    <form>
      <label>
        Title:
        <input type="text" name="title" onChange={props.handleChange} />
      </label>
      <button onClick={props.handleClick}>Add</button>
    </form>
  );
};

export const BookshelfApp: React.FC<{}> = () => {
  // // Mock Data
  // const books = [
  //   {
  //     title: 'Book1',
  //   },
  //   {
  //     title: 'Book2',
  //   },
  // ];

  const [list, setList] = useState([] as Book[]);
  const [formTitle, setFormTitle] = useState('');
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormTitle(event.target.value);
  };
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setList(list.concat({ title: formTitle }));
  };

  return (
    <React.Fragment>
      <Form handleChange={handleChange} handleClick={handleClick} />
      <BookList list={list} />
    </React.Fragment>
  );
};
