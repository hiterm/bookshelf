import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createBooks, renderBookList, testBooks } from "./BookListTestFixture";

describe("BookList sorting", () => {
  // The sort onClick is on the inner Group div, not the <th>.
  // Clicking the text element itself bubbles up to the Group handler.
  const getHeaderText = (name: string): HTMLElement => {
    const el = screen
      .getAllByText(name)
      .find((e) => e.closest("thead") !== null);
    if (el == null) {
      throw new Error(`Header text "${name}" not found in thead`);
    }
    return el;
  };

  test("sort priority descending puts highest priority first", async () => {
    const user = userEvent.setup();
    await renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    await user.click(getHeaderText("優先度"));

    await waitFor(() => {
      const bodyRows = screen
        .getAllByRole("row")
        .filter((r) => r.closest("tbody") != null);
      expect(within(bodyRows[0]).getByText("テスト書籍2")).toBeInTheDocument();
    });
  });

  test("restores priority sorting from route search", async () => {
    await renderBookList({
      sorting: [{ id: "priority", desc: true }],
    });

    await waitFor(() => {
      const bodyRows = screen
        .getAllByRole("row")
        .filter((row) => row.closest("tbody") != null);
      expect(within(bodyRows[0]).getByText("テスト書籍2")).toBeInTheDocument();
    });
  });

  test("sort priority ascending puts lowest priority first", async () => {
    const user = userEvent.setup();
    await renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    const priorityText = getHeaderText("優先度");
    await user.click(priorityText); // → desc
    await user.click(priorityText); // → asc

    await waitFor(() => {
      const bodyRows = screen
        .getAllByRole("row")
        .filter((r) => r.closest("tbody") != null);
      expect(within(bodyRows[0]).getByText("テスト書籍4")).toBeInTheDocument();
    });
  });

  test("sort title ascending puts テスト書籍1 first", async () => {
    const user = userEvent.setup();
    await renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    await user.click(getHeaderText("書名"));

    await waitFor(() => {
      const bodyRows = screen
        .getAllByRole("row")
        .filter((r) => r.closest("tbody") != null);
      expect(within(bodyRows[0]).getByText("テスト書籍1")).toBeInTheDocument();
    });
  });

  test("writes author reading sorting to route search", async () => {
    const user = userEvent.setup();
    const { router } = await renderBookList();

    await user.click(getHeaderText("著者読み仮名"));

    await waitFor(() => {
      expect(router.state.location.search.sorting).toEqual([
        { id: "authorYomis", desc: false },
      ]);
    });
  });

  test("restores author reading sorting from route search", async () => {
    await renderBookList({ sorting: [{ id: "authorYomis", desc: false }] }, [
      testBooks[1],
      testBooks[0],
    ]);

    await waitFor(() => {
      const bodyRows = screen
        .getAllByRole("row")
        .filter((row) => row.closest("tbody") != null);
      expect(within(bodyRows[0]).getByText("テスト書籍1")).toBeInTheDocument();
    });
  });

  test("sorting resets the URL page index", async () => {
    const user = userEvent.setup();
    const { router } = await renderBookList({ pageIndex: 2 });

    await waitFor(() => {
      expect(
        screen.getByRole("columnheader", { name: /優先度/ }),
      ).toBeVisible();
    });

    await user.click(getHeaderText("優先度"));

    await waitFor(() => {
      expect(router.state.location.search.sorting).toEqual([
        { id: "priority", desc: true },
      ]);
    });
    expect(router.state.location.search.pageIndex).toBeUndefined();
  });
});

describe("BookList pagination", () => {
  test("restores page index and size from route search", async () => {
    await renderBookList({ pageIndex: 1, pageSize: 20 }, createBooks(51));

    await waitFor(() => {
      expect(screen.getByText("テスト書籍21")).toBeInTheDocument();
    });
    expect(screen.queryByText("テスト書籍1")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Page size" })).toHaveValue(
      "20",
    );
  });

  test("writes page changes to route search", async () => {
    const { router } = await renderBookList({}, createBooks(21));

    fireEvent.click(await screen.findByRole("button", { name: "2" }));

    await waitFor(() => {
      expect(router.state.location.search.pageIndex).toBe(1);
    });
    expect(router.state.location.search.pageSize).toBeUndefined();
  });

  test("writes page size changes to route search", async () => {
    const user = userEvent.setup();
    const { router } = await renderBookList({}, createBooks(51));

    await user.click(
      await screen.findByRole("combobox", { name: "Page size" }),
    );
    await user.click(screen.getByRole("option", { name: "50" }));

    await waitFor(() => {
      expect(router.state.location.search.pageSize).toBe(50);
    });
    expect(router.state.location.search.pageIndex).toBeUndefined();
  });

  test("omits default pagination values from route search", async () => {
    const user = userEvent.setup();
    const { router } = await renderBookList(
      { pageIndex: 1, pageSize: 50 },
      createBooks(51),
    );

    fireEvent.click(await screen.findByRole("button", { name: "1" }));
    await user.click(screen.getByRole("combobox", { name: "Page size" }));
    await user.click(screen.getByRole("option", { name: "20" }));

    await waitFor(() => {
      expect(router.state.location.search.pageIndex).toBeUndefined();
      expect(router.state.location.search.pageSize).toBeUndefined();
    });
  });
});
