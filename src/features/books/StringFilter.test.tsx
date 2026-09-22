import { MantineProvider } from "@mantine/core";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { StringFilter } from "./StringFilter";
import type { StringFilterProps } from "./StringFilter";

const createColumn = (
  initialValue = "",
): {
  column: StringFilterProps["column"];
  setFilterValue: ReturnType<typeof vi.fn>;
  setExternalFilterValue: (value: string) => void;
} => {
  let filterValue = initialValue;
  const setFilterValue = vi.fn();
  // StringFilter only reads and writes these two column methods.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const column = {
    getFilterValue: () => filterValue,
    setFilterValue,
  } as unknown as StringFilterProps["column"];

  return {
    column,
    setFilterValue,
    setExternalFilterValue: (value: string) => {
      filterValue = value;
    },
  };
};

const renderFilter = (
  column: StringFilterProps["column"],
): ReturnType<typeof render> =>
  render(
    <MantineProvider env="test">
      <StringFilter column={column} />
    </MantineProvider>,
  );

describe("StringFilter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("applies the input value only after 1000 ms", () => {
    const { column, setFilterValue } = createColumn();
    renderFilter(column);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "書籍1" },
    });

    expect(setFilterValue).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(setFilterValue).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(setFilterValue).toHaveBeenCalledExactlyOnceWith("書籍1");
  });

  test("cancels the old value when input changes during debounce", () => {
    const { column, setFilterValue } = createColumn();
    renderFilter(column);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "古い値" } });
    act(() => {
      vi.advanceTimersByTime(600);
    });
    fireEvent.change(input, { target: { value: "新しい値" } });

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(setFilterValue).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(setFilterValue).toHaveBeenCalledExactlyOnceWith("新しい値");
  });

  test("syncs the input when an external filter value changes", () => {
    const { column, setExternalFilterValue } = createColumn("書籍1");
    const { rerender } = renderFilter(column);
    expect(screen.getByRole("textbox")).toHaveValue("書籍1");

    setExternalFilterValue("書籍2");
    rerender(
      <MantineProvider env="test">
        <StringFilter column={column} />
      </MantineProvider>,
    );

    expect(screen.getByRole("textbox")).toHaveValue("書籍2");
  });
});
