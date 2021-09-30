import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import React from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Select, TextField } from '../react-hook-form/mui';
import { BookFormType } from './schema';

type BookFormProps = { onSubmit: SubmitHandler<BookFormType> };

export const BookForm: React.FC<BookFormProps> = (props) => {
  const { control, handleSubmit } = useForm<BookFormType>();

  return (
    <form onSubmit={handleSubmit(props.onSubmit)}>
      <div>
        <TextField name="title" label="書名" control={control} />
      </div>
      <div>
        <FormControl>
          <InputLabel>形式</InputLabel>
          <Select name="format" control={control}>
            <MenuItem value={''}>-</MenuItem>
            <MenuItem value={'eBook'}>eBook</MenuItem>
            <MenuItem value={'Printed'}>Printed</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div>
        <FormControl>
          <InputLabel>ストア</InputLabel>
          <Select name="store" control={control}>
            <MenuItem value={''}>-</MenuItem>
            <MenuItem value={'Kindle'}>Kindle</MenuItem>
          </Select>
        </FormControl>
      </div>
      <input type="submit" />
      {/* <InputLabel shrink={true}>著者</InputLabel>
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
      </div> */}
    </form>
  );
};
