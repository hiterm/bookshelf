import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import React from 'react';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { Checkbox, Select, TextField } from '../react-hook-form/mui';
import { BookFormType } from './schema';

type BookFormProps = { onSubmit: SubmitHandler<BookFormType> };

export const BookForm: React.FC<BookFormProps> = (props) => {
  const { control, handleSubmit } = useForm<BookFormType>();
  const { fields, append, remove } = useFieldArray({
    name: 'authors',
    control,
  });

  return (
    <form onSubmit={handleSubmit(props.onSubmit)}>
      <div>
        <TextField name="title" label="書名" control={control} />
      </div>
      <div>
        {fields.map((field, index) => {
          return (
            <div key={field.id}>
              <InputLabel shrink={true}>著者</InputLabel>
              <div>
                <TextField name={`authors.${index}.name`} control={control} />
                <Button
                  variant="contained"
                  type="button"
                  onClick={() => remove(index)}
                >
                  -
                </Button>
              </div>
            </div>
          );
        })}
        <Button variant="contained" type="button" onClick={() => append({})}>
          著者追加
        </Button>
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
      <div>
        <TextField
          name="priority"
          type="number"
          label="優先度"
          control={control}
        />
      </div>
      <div>
        <TextField name="isbn" type="string" label="ISBN" control={control} />
      </div>
      <div>
        <Checkbox name="read" type="checkbox" label="既読" control={control} />
      </div>
      <div>
        <Checkbox name="owned" type="checkbox" label="所有" control={control} />
      </div>
      <input type="submit" />
    </form>
  );
};
