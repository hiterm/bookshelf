import { Button, Center, Loader, Pagination, Paper, Table, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useAuthorsQuery, useCreateAuthorMutation } from "../../generated/graphql";

type Author = {
  name: string;
};

type RegisterAuthorFormInput = {
  name: string;
};

const RegisterAuthorForm: React.FC = () => {
  const [_createAuthorResult, createAuthor] = useCreateAuthorMutation();
  const form = useForm<RegisterAuthorFormInput>({
    initialValues: { name: "" },
  });
  const handleSubmit = (data: RegisterAuthorFormInput) => createAuthor({ authorData: { name: data.name } });

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput label="名前" {...form.getInputProps("name")} />
      <Button type="submit" mt="md">
        登録
      </Button>
    </form>
  );
};

export const AuthorIndexPage: React.FC = () => {
  const context = useMemo(() => ({ additionalTypenames: ["Author"] }), []);
  const [result, _reexecuteQuery] = useAuthorsQuery({ context });
  const { data, fetching, error } = result;
  const [globalFilter, setGlobalFilter] = useState("");
  const columnHelper = createColumnHelper<Author>();
  const columns = [
    columnHelper.accessor("name", { header: "名前" }),
  ] as ColumnDef<Author>[];
  const table = useReactTable({
    data: data?.authors ?? [], // その場しのぎ
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (error != null) {
    return <>{JSON.stringify(error)}</>;
  }

  if (fetching || data == null) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  return (
    <>
      <Paper shadow="xs" p="md">
        <RegisterAuthorForm />
      </Paper>
      <Paper shadow="xs" p="md" mt="md">
        <TextInput
          placeholder="検索..."
          value={globalFilter}
          onChange={e => setGlobalFilter(e.currentTarget.value)}
          mb="md"
        />
        <Table>
          <Table.Thead>
            {table.getHeaderGroups().map(headerGroup => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <Table.Th key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>
          <Table.Tbody>
            {table.getRowModel().rows.map(row => (
              <Table.Tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <Table.Td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        <Center mt="md">
          <Pagination
            total={table.getPageCount()}
            value={table.getState().pagination.pageIndex + 1}
            onChange={(page) => table.setPageIndex(page - 1)}
          />
        </Center>
      </Paper>
    </>
  );
};
