import { MantineProvider } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { QueryClient } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AppErrorProvider } from "../components/errors/AppErrorProvider";
import { useLoggedInUser } from "../features/auth/api/useLoggedInUser";
import { useRegisterUser } from "../features/auth/api/useRegisterUser";
import { Route } from "./__root";

vi.mock(import("../features/auth/api/useLoggedInUser"));
vi.mock(import("../features/auth/api/useRegisterUser"));
vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({ isAuthenticated: true }),
}));
vi.mock("@mantine/notifications", () => ({
  showNotification: vi.fn(),
  Notifications: () => null,
}));
vi.mock("../components/layout/Header", () => ({ HeaderContents: () => null }));
vi.mock("../components/layout/Navbar", () => ({ NavbarContents: () => null }));
vi.mock("@tanstack/react-router-devtools", () => ({
  TanStackRouterDevtools: () => null,
}));
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  Outlet: () => <div>Registered page</div>,
}));

beforeAll(() => {
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
});

beforeEach(() => {
  vi.mocked(showNotification).mockClear();
  vi.mocked(useLoggedInUser, { partial: true }).mockReturnValue({
    data: { loggedInUser: null },
    isLoading: false,
    error: null,
  });
  vi.mocked(useRegisterUser, { partial: true }).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  });
});

const renderRoot = (): ReturnType<typeof render> => {
  const Root = Route.options.component;
  if (Root == null) throw new Error("Root component is missing");
  return render(<Root />, {
    wrapper: ({ children }) => (
      <MantineProvider env="test">
        <AppErrorProvider queryClient={new QueryClient()}>
          {children}
        </AppErrorProvider>
      </MantineProvider>
    ),
  });
};

test("handles user registration failure once and allows a successful retry", async () => {
  const mutateAsync = vi
    .fn()
    .mockRejectedValueOnce(new Error("Registration rejected"))
    .mockResolvedValueOnce({});
  vi.mocked(useRegisterUser, { partial: true }).mockReturnValue({
    mutateAsync,
    isPending: false,
  });
  renderRoot();
  const register = screen.getByRole("button", { name: "Register user" });
  fireEvent.click(register);
  await waitFor(() =>
    expect(
      screen.getByText("ユーザーの登録に失敗しました"),
    ).toBeInTheDocument(),
  );
  expect(showNotification).toHaveBeenCalledTimes(1);
  expect(screen.getAllByRole("alert")).toHaveLength(1);
  expect(register).toBeEnabled();
  fireEvent.click(register);
  await waitFor(() => {
    expect(mutateAsync).toHaveBeenCalledTimes(2);
  });
  expect(showNotification).toHaveBeenCalledTimes(1);
});

test("renders a safe local user query error", () => {
  vi.mocked(useLoggedInUser, { partial: true }).mockReturnValue({
    data: undefined,
    isLoading: false,
    error: new Error("User unavailable"),
  });
  renderRoot();
  expect(screen.getByRole("alert")).toHaveTextContent(
    "ユーザーの読み込みに失敗しました",
  );
  expect(screen.getByRole("alert")).toHaveTextContent("User unavailable");
  expect(showNotification).not.toHaveBeenCalled();
});
