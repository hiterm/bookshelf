import React from 'react';
import {
  useParams,
  useRouteMatch,
  Switch,
  Route,
  Link,
} from 'react-router-dom';
import { Formik, Field, Form } from 'formik';
import Button from '@material-ui/core/Button';
import { db } from '../Firebase';
import { Book } from './schema';
import { TextField, CheckboxWithLabel } from 'formik-material-ui';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import styled from 'styled-components';

const BookDetailShowItem: React.FC<{ field: string; value: string }> = (
  props
) => {
  return (
    <ListItemText
      primary={
        <React.Fragment>
          <Box display="inline-block" width={100} fontWeight="fontWeightBold">
            {props.field}
          </Box>
          <span>{props.value}</span>
        </React.Fragment>
      }
    />
  );
};

const StyledPaper = styled(Paper)`
  display: inline-block;
`;

const BookDetailShow: React.FC<{ book: Book | undefined }> = (props) => {
  const { url } = useRouteMatch();

  const book = props.book;

  if (book === undefined) {
    return <div>Loading or not found.</div>;
  }

  const handleDelete = () => {
    db.collection('books')
      .doc(book.id)
      .delete()
      .then(() => {
        console.log('Book successfully deleted!');
      })
      .catch((error) => {
        console.error('Error removing book: ', error);
      });
  };

  return (
    <React.Fragment>
      <div>
        <StyledPaper>
          <List>
            <ListItem>
              <BookDetailShowItem field="書名" value={book.title} />
            </ListItem>
            <Divider light variant="middle" />
            <ListItem>
              <BookDetailShowItem
                field="著者"
                value={book.authors.join(', ')}
              />
            </ListItem>
            <Divider light variant="middle" />
            <ListItem>
              <BookDetailShowItem
                field="優先度"
                value={book.priority.toString()}
              />
            </ListItem>
          </List>
        </StyledPaper>
      </div>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to={`${url}/edit`}
      >
        変更
      </Button>
      <Button variant="contained" color="secondary" onClick={handleDelete}>
        削除
      </Button>
    </React.Fragment>
  );
};

const BookDetailEdit: React.FC<{ book: Book | undefined }> = (props) => {
  const book = props.book;

  if (book === undefined) {
    return <div>Loading or not found.</div>;
  }

  return (
    <React.Fragment>
      <Formik
        initialValues={book}
        /* validationSchema={bookSchema} */
        onSubmit={(values) => {
          let docRef = db.collection('books').doc(book.id);
          docRef.update({
            priority: values.priority,
            read: values.read,
            owned: values.owned,
          });
        }}
      >
        <Form>
          <div>
            <Field
              component={TextField}
              name="title"
              type="string"
              label="書名"
            />
          </div>
          <div>著者：{book.authors.join(', ')}</div>
          <div>
            <Field
              component={TextField}
              name="priority"
              type="number"
              label="優先度"
            />
          </div>
          <div>
            <Field
              component={CheckboxWithLabel}
              name="read"
              Label={{ label: '既読' }}
            />
          </div>
          <div>
            <Field
              component={CheckboxWithLabel}
              name="owned"
              Label={{ label: '所有' }}
            />
          </div>
          <Button variant="contained" color="primary" type="submit">
            更新
          </Button>
        </Form>
      </Formik>
    </React.Fragment>
  );
};

const BookDetail: React.FC<{ books: Book[] }> = (props) => {
  const { path } = useRouteMatch();
  const { id } = useParams();

  const book: Book | undefined = props.books.find((book) => book.id === id);

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

export { BookDetail };
