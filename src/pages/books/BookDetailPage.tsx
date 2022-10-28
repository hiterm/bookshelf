import { Center, Loader } from '@mantine/core';
import React from 'react';
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import { BookDetailEdit } from '../../features/books/BookDetailEdit';
import { BookDetailShow } from '../../features/books/BookDetailShow';
import { graphQlBookToBook } from '../../features/books/schema';
import { useBookQuery } from '../../generated/graphql';

const BookDetailPage: React.FC = () => {
  const { path } = useRouteMatch();
  const { id } = useParams<{ id: string }>();

  const [result, _reexecuteQuery] = useBookQuery({ variables: { bookId: id } });
  const { data, fetching, error } = result;

  if (error != null) {
    return <>{JSON.stringify(error)}</>;
  }

  if (fetching || data == null) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  const graphqlBook = data.book;

  if (graphqlBook == null) {
    return <div>Not found.</div>;
  }

  const book = graphQlBookToBook(graphqlBook);

  return (
    <React.Fragment>
      <Switch>
        <Route exact path={path}>
          <BookDetailShow book={book} />
        </Route>
        <Route path={`${path}/edit`}>
          <BookDetailEdit book={book} />
        </Route>
      </Switch>
    </React.Fragment>
  );
};

export { BookDetailPage };
