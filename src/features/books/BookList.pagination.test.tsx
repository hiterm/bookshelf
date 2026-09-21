import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createBooks, renderBookList } from "./BookList.testSupport";

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
