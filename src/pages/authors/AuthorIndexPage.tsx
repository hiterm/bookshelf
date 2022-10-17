import { Button, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import MaterialTable, { Column } from '@material-table/core';
import { useMemo } from 'react';
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
  const form = useForm<RegisterAuthorFormInput>({
    initialValues: { name: '' },
  });
  const handleSubmit = (data: RegisterAuthorFormInput) =>
    createAuthor({ authorData: { name: data.name } });

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput label="名前" {...form.getInputProps('name')} />
      <Button type="submit">登録</Button>
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
      />
    </>
  );
};
