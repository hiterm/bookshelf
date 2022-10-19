import { Button, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { DataGrid } from 'mantine-data-grid';
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

  const columnHelper = createColumnHelper<Author>();

  // TODO: asを外す
  // https://github.com/TanStack/table/issues/4382
  // https://github.com/TanStack/table/issues/4302
  // https://github.com/TanStack/table/issues/4241
  const columns = [
    columnHelper.accessor('name', { header: '名前' }),
  ] as ColumnDef<Author>[];

  return (
    <>
      <RegisterAuthorForm />
      <DataGrid
        columns={columns}
        data={data.authors}
        striped
        highlightOnHover
        withGlobalFilter
        withPagination
        withColumnFilters
        withSorting
      />
    </>
  );
};
