import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { useState } from "react";
import { type Mock, vi } from "vitest";
import { AuthorsCombobox } from "./AuthorsCombobox";
import type { Author } from "./entity/Author";

const defaultAuthors: Author[] = [
  { id: "1", name: "name1" },
  { id: "2", name: "name2" },
];

beforeAll(() => {
  // Test stub; methods are intentionally no-ops.
  /* eslint-disable @typescript-eslint/no-empty-function */
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  /* eslint-enable @typescript-eslint/no-empty-function */
  HTMLElement.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

const mockMatchMedia = () => {
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
};

type TestComboboxProps = {
  onChange: Mock;
  initial?: Author[];
  authors?: Author[];
  error?: React.ReactNode;
};

const TestCombobox: React.FC<TestComboboxProps> = ({
  onChange,
  initial = [],
  authors = defaultAuthors,
  error,
}) => {
  const [value, setValue] = useState(initial);
  return (
    <MantineProvider env="test">
      <AuthorsCombobox
        authors={authors}
        value={value}
        onChange={(updated) => {
          setValue(updated);
          onChange(updated);
        }}
        error={error}
      />
    </MantineProvider>
  );
};

describe("AuthorsCombobox", () => {
  test("selects an existing author", async () => {
    mockMatchMedia();
    const onChange = vi.fn();
    render(<TestCombobox onChange={onChange} />);

    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime.bind(vi),
    });
    const input = screen.getByRole("textbox", { name: "著者" });
    await user.click(input);

    await user.click(await screen.findByRole("option", { name: "name1" }));

    expect(onChange).toHaveBeenLastCalledWith([{ id: "1", name: "name1" }]);
  });

  test("deselects an already selected author", async () => {
    mockMatchMedia();
    const onChange = vi.fn();
    render(
      <TestCombobox
        onChange={onChange}
        initial={[{ id: "1", name: "name1" }]}
      />,
    );

    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime.bind(vi),
    });
    const input = screen.getByRole("textbox", { name: "著者" });
    await user.click(input);

    await user.click(await screen.findByRole("option", { name: "name1" }));

    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  test("shows '+ Create' option for non-matching search", async () => {
    mockMatchMedia();
    const onChange = vi.fn();
    render(<TestCombobox onChange={onChange} />);

    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime.bind(vi),
    });
    const input = screen.getByRole("textbox", { name: "著者" });
    await user.click(input);
    await user.type(input, "NewAuthor");

    expect(
      await screen.findByRole("option", { name: "+ Create NewAuthor" }),
    ).toBeInTheDocument();
  });

  test("does not show '+ Create' on exact name match", async () => {
    mockMatchMedia();
    const onChange = vi.fn();
    render(<TestCombobox onChange={onChange} />);

    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime.bind(vi),
    });
    const input = screen.getByRole("textbox", { name: "著者" });
    await user.click(input);
    await user.type(input, "name1");

    expect(
      screen.queryByRole("option", { name: "+ Create name1" }),
    ).not.toBeInTheDocument();
  });

  test("creates a pending author when '+ Create' is clicked", async () => {
    mockMatchMedia();
    const onChange = vi.fn();
    render(<TestCombobox onChange={onChange} />);

    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime.bind(vi),
    });
    const input = screen.getByRole("textbox", { name: "著者" });
    await user.click(input);
    await user.type(input, "NewAuthor");

    await user.click(
      await screen.findByRole("option", { name: "+ Create NewAuthor" }),
    );

    expect(onChange).toHaveBeenLastCalledWith([
      { id: "__pending__:NewAuthor", name: "NewAuthor" },
    ]);
  });

  test("removes a pill via remove button", async () => {
    mockMatchMedia();
    const onChange = vi.fn();
    const { container } = render(
      <TestCombobox
        onChange={onChange}
        initial={[{ id: "1", name: "name1" }]}
      />,
    );

    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime.bind(vi),
    });
    // Mantine renders the Pill remove button with aria-hidden; query by aria-label attribute.
    const removeButton = container.querySelector(
      '[aria-label="Remove author name1"]',
    );
    if (!removeButton) throw new Error("Remove button not found");
    await user.click(removeButton);

    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  test("removes last author via Backspace with empty input", async () => {
    mockMatchMedia();
    const onChange = vi.fn();
    render(
      <TestCombobox
        onChange={onChange}
        initial={[{ id: "1", name: "name1" }]}
      />,
    );

    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime.bind(vi),
    });
    const input = screen.getByRole("textbox", { name: "著者" });
    await user.click(input);
    await user.keyboard("{Backspace}");

    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  test("shows error message when error prop is set", () => {
    mockMatchMedia();
    const onChange = vi.fn();
    render(<TestCombobox onChange={onChange} error="著者は必須です" />);

    expect(screen.getByText("著者は必須です")).toBeInTheDocument();
  });
});
