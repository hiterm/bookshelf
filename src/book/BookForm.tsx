import React from 'react';
import { Formik, Field, Form, FieldArray } from 'formik';
import Button from '@material-ui/core/Button';
import { TextField, CheckboxWithLabel, Select } from 'formik-material-ui';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import { bookSchema, Book } from './schema';

export const BookForm: React.FC<{
  book: Book;
  submitLabel: string,
  onSubmit: (values: Book) => Promise<void>;
}> = ({ book, submitLabel, onSubmit }) => {
  return (
    <React.Fragment>
      <Formik
        initialValues={book}
        validationSchema={bookSchema}
        onSubmit={onSubmit}
      >
        {({ values }) => (
          <Form>
            <div>
              <Field
                component={TextField}
                name="title"
                type="string"
                label="書名"
              />
            </div>
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
            <div>
              <FormControl>
                <InputLabel>形式</InputLabel>
                <Field component={Select} name="format">
                  <MenuItem value={''}>-</MenuItem>
                  <MenuItem value={'eBook'}>eBook</MenuItem>
                  <MenuItem value={'Printed'}>Printed</MenuItem>
                </Field>
              </FormControl>
            </div>
            <div>
              <FormControl>
                <InputLabel>ストア</InputLabel>
                <Field component={Select} name="store">
                  <MenuItem value={''}>-</MenuItem>
                  <MenuItem value={'Kindle'}>Kindle</MenuItem>
                </Field>
              </FormControl>
            </div>
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
                component={TextField}
                name="isbn"
                type="string"
                label="ISBN"
              />
            </div>
            <div>
              <Field
                component={CheckboxWithLabel}
                color="primary"
                name="read"
                type="checkbox"
                Label={{ label: '既読' }}
              />
            </div>
            <div>
              <Field
                component={CheckboxWithLabel}
                color="primary"
                name="owned"
                type="checkbox"
                Label={{ label: '所有' }}
              />
            </div>
            <Button variant="contained" color="primary" type="submit">
              {submitLabel}
            </Button>
          </Form>
        )}
      </Formik>
    </React.Fragment>
  );
};
