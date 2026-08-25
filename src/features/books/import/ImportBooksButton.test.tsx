import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, expect, test, vi } from "vitest";
import { ImportBooksButton } from "./ImportBooksButton";

const navigate = vi.fn();
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  useNavigate: () => navigate,
}));

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

test("navigates from the books import action to the import page", async () => {
  render(
    <MantineProvider env="test">
      <ImportBooksButton />
    </MantineProvider>,
  );
  await userEvent.click(screen.getByRole("button", { name: "一括インポート" }));
  expect(navigate).toHaveBeenCalledWith({ to: "/books/import" });
});
