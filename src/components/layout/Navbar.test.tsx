import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { NavbarContents } from "./Navbar";

vi.mock("../mantineTsr", () => ({
  NavLink: ({ label, to }: { label: string; to: string }) => (
    <a href={to}>{label}</a>
  ),
}));

test("settings links directly to backup", () => {
  render(<NavbarContents />);
  expect(screen.getByRole("link", { name: "設定" })).toHaveAttribute(
    "href",
    "/settings/backup",
  );
});
