import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { Field, FieldArray, Form, FormikProps } from 'formik';
import { CheckboxWithLabel, Select, TextField } from 'formik-material-ui';
import React from 'react';
import { BookFormProps } from './schema';

export const BookForm: React.FC<FormikProps<BookFormProps>> = (props) => {
  return (
    <Form>
      <div>
        <Field component={TextField} name="title" type="string" label="書名" />
      </div>
      <InputLabel shrink={true}>著者</InputLabel>
      <FieldArray
        name="authors"
        render={(arrayHelpers) => (
          <div>
            {props.values.authors.map((_author: string, index: number) => (
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
        <Field component={TextField} name="isbn" type="string" label="ISBN" />
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
    </Form>
  );
};
