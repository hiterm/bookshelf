import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderBookList } from "./BookList.testSupport";

describe("BookList preset and reset", () => {
  test("preset filter shows only unread owned books", async () => {
    const { router } = await renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    // fireEvent opens the Mantine Menu reliably in jsdom (user.click fires
    // pointer events that the Menu's internal handler may not catch).
    fireEvent.click(screen.getByRole("button", { name: "Preset filters" }));

    await waitFor(() => {
      expect(
        screen.getByText("Unread owned, order by priority"),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Unread owned, order by priority"));

    await waitFor(() => {
      expect(screen.queryByText("テスト書籍2")).not.toBeInTheDocument();
    });
    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍4")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    expect(router.state.location.search).toMatchObject({
      columnFilters: [
        { id: "read", value: false },
        { id: "owned", value: true },
      ],
      sorting: [{ id: "priority", desc: true }],
    });
    expect(router.state.location.search.pageIndex).toBeUndefined();
  });

  test("reset filter restores all books", async () => {
    await renderBookList();

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

    fireEvent.click(screen.getByRole("button", { name: "Reset filter" }));

    await waitFor(() => {
      expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    });
    expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍3")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍4")).toBeInTheDocument();
  });

  test("reset filter clears the title input", async () => {
    await renderBookList();

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

    fireEvent.click(screen.getByRole("button", { name: "Reset filter" }));

    await waitFor(() => {
      expect(titleInput).toHaveValue("");
    });
  });

  test("restores and applies inclusive purchase date range from route search", async () => {
    const { router } = await renderBookList({
      columnFilters: [
        {
          id: "purchaseDate",
          value: { from: "2024-02-10", to: "2024-03-20" },
        },
      ],
    });

    expect(screen.getByLabelText("購入日 From")).toHaveValue("2024-02-10");
    expect(screen.getByLabelText("購入日 To")).toHaveValue("2024-03-20");
    expect(screen.getByText("テスト書籍3")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍4")).toBeInTheDocument();
    expect(screen.queryByText("テスト書籍1")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍2")).not.toBeInTheDocument();
    expect(router.state.location.search.columnFilters).toEqual([
      {
        id: "purchaseDate",
        value: { from: "2024-02-10", to: "2024-03-20" },
      },
    ]);
  });

  test("restores an empty purchase date range without hiding undated books", async () => {
    await renderBookList({
      columnFilters: [{ id: "purchaseDate", value: {} }],
    });

    expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍3")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍4")).toBeInTheDocument();
  });

  test("sorts purchase dates in both directions", async () => {
    const user = userEvent.setup();
    await renderBookList();
    const purchaseDateHeader = screen.getByText("購入日");

    await user.click(purchaseDateHeader);
    await waitFor(() => {
      const rows = screen
        .getAllByRole("row")
        .filter((row) => row.closest("tbody") != null);
      expect(within(rows[0]).getByText("テスト書籍1")).toBeInTheDocument();
    });

    await user.click(purchaseDateHeader);
    await waitFor(() => {
      const rows = screen
        .getAllByRole("row")
        .filter((row) => row.closest("tbody") != null);
      expect(within(rows[0]).getByText("テスト書籍3")).toBeInTheDocument();
    });
  });
});
