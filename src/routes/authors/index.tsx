import {
  Button,
  Center,
  Loader,
  Pagination,
  Paper,
  Table,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { createFileRoute } from "@tanstack/react-router";
import { zod4Resolver } from "mantine-form-zod-resolver";
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  flexRender,
  globalFilteringFeature,
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { useCreateAuthor } from "../../compoments/hooks/useCreateAuthor";
import { useAuthors } from "../../compoments/hooks/useAuthors";
import { Link } from "../../compoments/mantineTsr";
import {
  authorFormSchema,
  type AuthorFormValues,
} from "../../features/authors/authorFormSchema";
import type { Author } from "../../features/books/entity/Author";

const authorTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
});

const authorColumnHelper = createColumnHelper<
  typeof authorTableFeatures,
  Author
>();

const authorColumns = authorColumnHelper.columns([
  authorColumnHelper.accessor("name", {
    header: "名前",
    cell: ({ row }) => (
      <Link to="/authors/$id" params={{ id: row.original.id }}>
        {row.getValue("name")}
      </Link>
    ),
  }),
  authorColumnHelper.accessor("yomi", {
    header: "読み仮名",
  }),
]);

export const Route = createFileRoute("/authors/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AuthorIndexPage />;
}

const RegisterAuthorForm: React.FC = () => {
  const createAuthorMutation = useCreateAuthor();
  const form = useForm<AuthorFormValues>({
    initialValues: { name: "", yomi: "" },
    validate: zod4Resolver(authorFormSchema),
  });
  const handleSubmit = (data: AuthorFormValues) => {
    if (createAuthorMutation.isPending) return;
    createAuthorMutation.mutate({ name: data.name, yomi: data.yomi });
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput label="名前" {...form.getInputProps("name")} />
      <TextInput label="読み仮名" {...form.getInputProps("yomi")} />
      <Button
        type="submit"
        mt="md"
        disabled={createAuthorMutation.isPending}
        loading={createAuthorMutation.isPending}
      >
        登録
      </Button>
    </form>
  );
};

const AuthorIndexPage: React.FC = () => {
  const { data, isLoading, error } = useAuthors();
  const [globalFilter, setGlobalFilter] = useState("");
  const table = useTable({
    features: authorTableFeatures,
    data: data?.authors ?? [], // その場しのぎ
    columns: authorColumns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  if (error != null) {
    return <>{JSON.stringify(error)}</>;
  }

  if (isLoading || data == null) {
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
          onChange={(e) => {
            setGlobalFilter(e.currentTarget.value);
          }}
          mb="md"
        />
        <Table>
          <Table.Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.Th key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>
          <Table.Tbody>
            {table.getRowModel().rows.map((row) => (
              <Table.Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
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
            value={table.state.pagination.pageIndex + 1}
            onChange={(page) => {
              table.setPageIndex(page - 1);
            }}
          />
        </Center>
      </Paper>
    </>
  );
};
