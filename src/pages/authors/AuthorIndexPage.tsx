import MaterialTable, { Column } from '@material-table/core';
import { Button } from '@mui/material';
import { useMemo } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { tableIcons } from '../../features/material-table/tableIcons';
import { TextField } from '../../features/react-hook-form/mui';
import {
  useAuthorsQuery,
  useCreateAuthorMutation,
} from '../../generated/graphql';

type Author = {
  name: string;
};

type RegisterAuthorFormInput = {
  name: string;
};

const RegisterAuthorForm: React.FC = () => {
  const [_createAuthorResult, createAuthor] = useCreateAuthorMutation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterAuthorFormInput>({
    mode: 'all',
    defaultValues: { name: '' },
  });
  const onSubmit: SubmitHandler<RegisterAuthorFormInput> = (data) =>
    createAuthor({ authorData: { name: data.name } });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label="名前"
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
        control={{ control, name: 'name' }}
      />
      <Button variant="contained" onClick={handleSubmit(onSubmit)}>
        登録
      </Button>
    </form>
  );
};

export const AuthorIndexPage: React.FC = () => {
  const context = useMemo(() => ({ additionalTypenames: ['Author'] }), []);
  const [result, _reexecuteQuery] = useAuthorsQuery({ context });
  const { data, fetching, error } = result;

  if (error != null) {
    return <>{JSON.stringify(error)}</>;
  }

  if (fetching || data == null) {
    return <>loading</>;
  }

  const columns: Column<Author>[] = [
    {
      title: '名前',
      field: 'name',
    },
  ];

  return (
    <>
      <RegisterAuthorForm />
      <MaterialTable
        columns={columns}
        data={data.authors}
        title=""
        options={{
          filtering: true,
          columnsButton: true,
          pageSize: 20,
          pageSizeOptions: [20, 50, 100, 500, 1000],
        }}
        icons={tableIcons}
      />
    </>
  );
};
