import { zodResolver } from '@hookform/resolvers/zod';
import { Box, TextField } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuthorsQuery } from '../../generated/graphql';
import {
  Autocomplete,
  Checkbox,
  Select,
  TextField as RhfTextField,
} from '../react-hook-form/mui';
import { Author, GraphQLBookBase } from './schema';

const bookFormSchema = z.object({
  title: z.string().min(1),
  authors: z.array(z.object({ id: z.string(), name: z.string() })).nonempty(),
  isbn: z.string().regex(/(^$|^(\d-?){12}\d$)/),
  read: z.boolean().default(false),
  priority: z.number().int().min(0).max(100).default(50),
  format: z.enum(['E_BOOK', 'PRINTED', 'UNKNOWN']),
  store: z.enum(['KINDLE', 'UNKNOWN']),
  owned: z.boolean().default(false),
});

type BookFormProps = {
  onSubmit: SubmitHandler<GraphQLBookBase>;
  initialValues: GraphQLBookBase;
};

export const useBookForm = (props: BookFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'all',
    resolver: zodResolver(bookFormSchema),
    defaultValues: props.initialValues,
  });

  const [open, setOpen] = React.useState(false);
  const [queryResult, reexecuteQuery] = useAuthorsQuery({ pause: true });
  const loadingAuthorOptions = open && queryResult.data == null;

  React.useEffect(() => {
    if (!loadingAuthorOptions) {
      return;
    }

    (async () => {
      reexecuteQuery();
    })();
  }, [loadingAuthorOptions]);

  const renderForm = () => (
    <form>
      <div>{JSON.stringify(errors)}</div>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <RhfTextField
          label="書名"
          error={Boolean(errors.title)}
          helperText={errors.title?.message}
          control={{ control, name: 'title' }}
        />
        <Autocomplete
          label="著者"
          error={Boolean(errors.authors)}
          helperText={
            (errors.authors as { message: string } | undefined)?.message // TODO: 型がおかしいので無理やり直している
          }
          control={{ control, name: 'authors' }}
          multiple
          freeSolo
          id="tags-outlined"
          options={queryResult.data == null ? [] : queryResult.data.authors}
          getOptionLabel={(option) => option.name}
          filterSelectedOptions
          open={open}
          onOpen={() => {
            setOpen(true);
          }}
          onClose={() => {
            setOpen(false);
          }}
          loading={loadingAuthorOptions}
        />
        <Select
          name="format"
          label="形式"
          error={Boolean(errors.format)}
          helperText={errors.format?.message}
          control={control}
        >
          <MenuItem value={'UNKNOWN'}>-</MenuItem>
          <MenuItem value={'E_BOOK'}>eBook</MenuItem>
          <MenuItem value={'PRINTED'}>Printed</MenuItem>
        </Select>
        <Select
          name="store"
          label="ストア"
          error={Boolean(errors.store)}
          helperText={errors.store?.message}
          control={control}
        >
          <MenuItem value={'UNKNOWN'}>-</MenuItem>
          <MenuItem value={'KINDLE'}>Kindle</MenuItem>
        </Select>
        <RhfTextField
          type="number"
          label="優先度"
          error={Boolean(errors.priority)}
          helperText={errors.priority?.message}
          control={{
            control,
            name: 'priority',
            transform: {
              input: (value: number) => (isNaN(value) ? '' : value.toString()),
              output: (e) => parseInt(e.target.value, 10),
            },
          }}
        />
        <RhfTextField
          type="string"
          label="ISBN"
          error={Boolean(errors.isbn)}
          helperText={errors.isbn?.message}
          control={{ control, name: 'isbn' }}
        />
        <Checkbox name="read" label="既読" control={control} />
        <Checkbox name="owned" label="所有" control={control} />
      </Box>
    </form>
  );

  return { renderForm, submitForm: handleSubmit(props.onSubmit) };
};
