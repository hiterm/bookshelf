import { MantineProvider } from "@mantine/core";
import * as routerActual from "@tanstack/react-router" with {
  rstest: "importActual",
};
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, expect, test, rs } from "@rstest/core";
import { ImportBooksButton } from "./ImportBooksButton";

const navigate = rs.fn();
rs.mock("@tanstack/react-router", () => ({
  ...routerActual,
  useNavigate: () => navigate,
}));

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: rs.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addListener: rs.fn(),
      removeListener: rs.fn(),
      addEventListener: rs.fn(),
      removeEventListener: rs.fn(),
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
