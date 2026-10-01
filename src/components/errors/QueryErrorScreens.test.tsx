import { MantineProvider } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTable } from "@tanstack/react-table";
import { bookColumns } from "../../features/books/bookColumns";
import { bookTableFeatures } from "../../features/books/bookTable";
import type { Book } from "../../features/books/entity/Book";
import { render, screen } from "@testing-library/react";
import { GraphQLError } from "graphql";
import { ClientError } from "graphql-request";
import { useAuthors } from "../../features/authors/api/useAuthors";
import { useAuthor } from "../../features/authors/api/useAuthor";
import { AuthorLoader } from "../../features/authors/AuthorLoader";
import { AuthorsFilter } from "../../features/books/AuthorsFilter";
import { BookCreateForm } from "../../features/books/BookCreateForm";
import { BookUpdateForm } from "../../features/books/BookUpdateForm";
import type { BookFormValues } from "../../features/books/bookFormSchema";

vi.mock(import("../../features/authors/api/useAuthors"));
vi.mock(import("../../features/authors/api/useAuthor"));

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

const failure = new ClientError(
  {
    status: 403,
    headers: new Headers(),
    body: "",
    errors: [new GraphQLError("Authors unavailable")],
  },
  {
    query: "query authors { authors { id } }",
    variables: { token: "request-secret" },
  },
);

beforeEach(() => {
  vi.mocked(useAuthors, { partial: true }).mockReturnValue({
    data: undefined,
    isLoading: false,
    error: failure,
  });
  vi.mocked(useAuthor, { partial: true }).mockReturnValue({
    data: undefined,
    isLoading: false,
    error: failure,
  });
});

const FormScreen = ({ create }: { create: boolean }): React.JSX.Element => {
  const form = useForm<BookFormValues>({
    initialValues: {
      title: "",
      authors: [],
      isbn: "",
      read: false,
      owned: false,
      priority: 50,
      format: "UNKNOWN",
      store: "UNKNOWN",
      purchaseDate: "",
    },
  });
  return create ? (
    <BookCreateForm form={form} />
  ) : (
    <BookUpdateForm form={form} />
  );
};

const FilterScreen = (): React.JSX.Element => {
  const books: Book[] = [];
  const table = useTable({
    features: bookTableFeatures,
    data: books,
    columns: bookColumns,
  });
  const column = table.getColumn("authors");
  if (column == null) throw new Error("Authors column is missing");
  return <AuthorsFilter column={column} />;
};

test.each([
  [
    "author loader",
    <AuthorLoader key="loader" id="author-1">
      {() => <div>Loaded</div>}
    </AuthorLoader>,
  ],
  ["author filter", <FilterScreen key="filter" />],
  ["book create form", <FormScreen key="create" create />],
  ["book update form", <FormScreen key="update" create={false} />],
])(
  "%s displays the safe response message without raw logging",
  (_name, component) => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    render(component, {
      wrapper: ({ children }) => (
        <MantineProvider env="test">{children}</MantineProvider>
      ),
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Authors unavailable");
    expect(document.body.textContent).not.toContain("request-secret");
    expect(document.body.textContent).not.toContain("query authors");
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  },
);
