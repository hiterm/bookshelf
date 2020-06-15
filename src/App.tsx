import React from 'react';
import './App.css';

type Book = {
  title: string;
};

const BookList = (props: { list: Book[] }) => (
  <ul>
    {props.list.map((book) => (
      <li>{book.title}</li>
    ))}
  </ul>
);

const App: React.FC<{}> = () => {
  const books = [
    {
      title: 'Book1',
    },
    {
      title: 'Book2',
    },
  ];
  return (
    <div className="App">
      <BookList list={books} />
    </div>
  );
};

export default App;
