import React, { useState, useEffect } from 'react';
import { Formik, Field, FieldArray, Form } from 'formik';
import { TextField } from 'formik-material-ui';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import MaterialTable from 'material-table';
import { firebase, db } from '../Firebase';
import { Book, bookFormSchema, firebaseDocToBook } from './schema';

const BookList: React.FC<{ list: Book[] }> = (props) => {
  const columns = [
    { title: '書名', field: 'title' },
    { title: '著者', field: 'authors' },
  ];
  const options = {
    pageSize: 20,
    filtering: true,
  };
  return (
    <MaterialTable columns={columns} data={props.list} options={options} />
  );
};

const BookAddForm: React.FC<{}> = () => {
  const handleSubmit = (values: any) => {
    return db.collection('books').add({
      title: values.title,
      authors: values.authors,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  };

  return (
    <Formik
      initialValues={{ title: '', authors: [''] }}
      validationSchema={bookFormSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors }) => (
        <Form>
          <Field
            component={TextField}
            name="title"
            label="タイトル"
            InputLabelProps={{ shrink: true }}
          />
          <InputLabel shrink={true}>著者</InputLabel>
          <FieldArray
            name="authors"
            render={(arrayHelpers) => (
              <div>
                {values.authors.map((_author: string, index: number) => (
                  <div key={index}>
                    <Field component={TextField} name={`authors.${index}`} />
                    <Button
                      variant="contained"
                      type="button"
                      onClick={() => arrayHelpers.remove(index)}
                    >
                      -
                    </Button>
                  </div>
                ))}
                <Button
                  variant="contained"
                  type="button"
                  onClick={() => arrayHelpers.push('')}
                >
                  著者追加
                </Button>
              </div>
            )}
          />
          <Button variant="contained" color="primary" type="submit">
            Add
          </Button>
        </Form>
      )}
    </Formik>
  );
};

const BookIndex: React.FC<{}> = () => {
  const [list, setList] = useState([] as Book[]);

  useEffect(() => {
    const unsubscribe = db.collection('books').onSnapshot((querySnapshot) => {
      const list = querySnapshot.docs.map(firebaseDocToBook);
      // debug
      // castedList.forEach((book) => console.log(JSON.stringify(book)));
      setList(list);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <React.Fragment>
      <h2>追加</h2>
      <BookAddForm />
      <h2>一覧</h2>
      <BookList list={list} />
    </React.Fragment>
  );
};

export { BookIndex };
