import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { renderBookList } from "./BookList.testSupport";

describe("BookList filters", () => {
  test("shows all books initially", async () => {
    await renderBookList();
    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍3")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍4")).toBeInTheDocument();
  });

  test("shows author readings in an independent column", async () => {
    await renderBookList();

    await waitFor(() => {
      expect(
        screen.getByRole("columnheader", { name: "著者読み仮名" }),
      ).toBeInTheDocument();
    });
    const row = screen.getByRole("row", { name: /テスト書籍1/ });
    expect(within(row).getByText("ちょしゃいち")).toBeInTheDocument();
  });

  test("author reading filter shows only books with a matching reading", async () => {
    await renderBookList();

    const readingInput = within(
      screen.getByTestId("filter-authorYomis"),
    ).getByRole("textbox");
    fireEvent.change(readingInput, { target: { value: "いち" } });

    await waitFor(
      () => {
        expect(screen.queryByText("テスト書籍2")).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.queryByText("テスト書籍4")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍3")).toBeInTheDocument();
  });

  test("restores the author reading filter from route search", async () => {
    await renderBookList({
      columnFilters: [{ id: "authorYomis", value: "に" }],
    });

    const readingInput = within(
      screen.getByTestId("filter-authorYomis"),
    ).getByRole("textbox");
    expect(readingInput).toHaveValue("に");
    expect(screen.queryByText("テスト書籍1")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍4")).toBeInTheDocument();
  });

  test("uses column filters from route search", async () => {
    await renderBookList({
      columnFilters: [{ id: "title", value: "書籍2" }],
    });

    await waitFor(() => {
      expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    });
    expect(screen.queryByText("テスト書籍1")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍4")).not.toBeInTheDocument();
  });

  test("syncs the title filter input from route changes", async () => {
    const { router } = await renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    await act(async () => {
      await router.navigate({
        to: "/books",
        search: { columnFilters: [{ id: "title", value: "書籍2" }] },
      });
    });

    const titleInput = within(screen.getByTestId("filter-title")).getByRole(
      "textbox",
    );
    await waitFor(() => {
      expect(titleInput).toHaveValue("書籍2");
    });
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    expect(screen.queryByText("テスト書籍1")).not.toBeInTheDocument();
  });

  test("title string filter shows only matching books", async () => {
    const { router } = await renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    const titleInput = within(screen.getByTestId("filter-title")).getByRole(
      "textbox",
    );
    fireEvent.change(titleInput, { target: { value: "書籍1" } });

    await waitFor(
      () => {
        expect(screen.queryByText("テスト書籍2")).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍4")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    expect(router.state.location.search.columnFilters).toEqual([
      { id: "title", value: "書籍1" },
    ]);
  });

  test("ISBN string filter shows only matching books", async () => {
    await renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    const isbnInput = within(screen.getByTestId("filter-isbn")).getByRole(
      "textbox",
    );
    fireEvent.change(isbnInput, { target: { value: "000002" } });

    await waitFor(
      () => {
        expect(screen.queryByText("テスト書籍1")).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍4")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
  });

  test("read filter = true shows only read books", async () => {
    await renderBookList({ columnFilters: [{ id: "read", value: true }] });

    await waitFor(() => {
      expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    });

    expect(screen.queryByText("テスト書籍1")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍4")).toBeInTheDocument();
  });

  test("read filter = false shows only unread books", async () => {
    await renderBookList({ columnFilters: [{ id: "read", value: false }] });

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    expect(screen.queryByText("テスト書籍2")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍4")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍3")).toBeInTheDocument();
  });

  test("owned filter = true shows only owned books", async () => {
    await renderBookList({ columnFilters: [{ id: "owned", value: true }] });

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍4")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
  });

  test("format filter = PRINTED shows only printed books", async () => {
    await renderBookList({
      columnFilters: [{ id: "format", value: "PRINTED" }],
    });

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    expect(screen.queryByText("テスト書籍2")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍4")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
  });

  test("format filter = E_BOOK shows only eBook books", async () => {
    await renderBookList({
      columnFilters: [{ id: "format", value: "E_BOOK" }],
    });

    await waitFor(() => {
      expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    });

    expect(screen.queryByText("テスト書籍1")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍4")).toBeInTheDocument();
  });

  test("store filter = KINDLE shows only Kindle books", async () => {
    await renderBookList({ columnFilters: [{ id: "store", value: "KINDLE" }] });

    await waitFor(() => {
      expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    });

    expect(screen.queryByText("テスト書籍1")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍4")).toBeInTheDocument();
  });

  test("authors filter shows only books by selected author", async () => {
    await renderBookList({
      columnFilters: [{ id: "authors", value: ["author-1"] }],
    });

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    expect(screen.queryByText("テスト書籍2")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍4")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍3")).toBeInTheDocument();
  });
});
