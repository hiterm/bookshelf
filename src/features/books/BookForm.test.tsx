import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Client, Provider } from "urql";
import { vi } from "vitest";
import { fromValue } from "wonka";
import { useBookForm } from "./BookForm";
import { IBookForm } from "./types";

const emptyBook: IBookForm = {
  title: "",
  authors: [{ id: "c156c887-e162-4777-85c9-ec474a666a87", name: "author1" }],
  isbn: "",
  read: false,
  owned: false,
  priority: 50,
  format: "UNKNOWN",
  store: "UNKNOWN",
};

type TestFormProps = { onSubmit: (values: IBookForm) => void };

const TestForm: React.FC<TestFormProps> = ({ onSubmit }) => {
  const { form, submitForm } = useBookForm({
    initialValues: emptyBook,
    onSubmit: onSubmit,
  });

  return (
    <form onSubmit={submitForm}>
      {form}
      <button type="submit">送信</button>
    </form>
  );
};

describe("useBookForm", () => {
  test("works", async () => {
    const mockClient = {
      executeQuery: vi.fn(() =>
        fromValue({
          data: {
            authors: [
              { id: "1", name: "name1" },
              { id: "2", name: "name2" },
            ],
          },
        })
      ),
    };

    // https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <Provider value={mockClient as unknown as Client}>{children}</Provider>
    );
    const mockSubmit = vi.fn((_book: IBookForm) => {});

    const { getByRole, findByRole } = render(
      <TestForm onSubmit={mockSubmit} />,
      {
        wrapper: wrapper,
      },
    );

    // TODO: 著者など他のフィールドもテストする
    const titleInput = await findByRole("textbox", {
      name: "書名",
    });
    const user = userEvent.setup();
    await user.type(titleInput, "valid title");

    await userEvent.click(getByRole("button", { name: "送信" }));

    expect(mockSubmit.mock.calls.length).toBe(1);
    expect(mockSubmit.mock.calls[0][0]).toEqual({
      ...emptyBook,
      title: "valid title",
    });
  });
});
