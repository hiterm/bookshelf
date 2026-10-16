import { afterEach, beforeEach, expect, test, vi } from "vitest";

const { config, start, createRoot, render } = vi.hoisted(() => ({
  config: { isDemoMode: false },
  start: vi.fn<() => Promise<void>>(),
  createRoot: vi.fn(),
  render: vi.fn(),
}));

vi.mock("./config", () => config);
vi.mock("./mocks/browser", () => ({ worker: { start } }));
vi.mock("react-dom/client", () => ({ createRoot }));
vi.mock("./App", () => ({ App: () => null }));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  config.isDemoMode = false;
  createRoot.mockReturnValue({ render });
  document.body.innerHTML = '<div id="root"></div>';
});

afterEach(() => {
  document.body.innerHTML = "";
});

test("renders the application without starting MSW in normal mode", async () => {
  await import("./index");

  expect(start).not.toHaveBeenCalled();
  expect(createRoot).toHaveBeenCalledWith(document.getElementById("root"));
  expect(render).toHaveBeenCalledOnce();
});

test("waits for MSW to start before rendering in demo mode", async () => {
  config.isDemoMode = true;
  const ready = Promise.withResolvers<undefined>();
  start.mockReturnValue(ready.promise);

  await import("./index");

  try {
    await vi.waitFor(() => {
      expect(start).toHaveBeenCalledExactlyOnceWith({
        onUnhandledFrame: "bypass",
      });
    });
    expect(createRoot).not.toHaveBeenCalled();
    expect(render).not.toHaveBeenCalled();
  } finally {
    ready.resolve(undefined);
  }

  await vi.waitFor(() => {
    expect(render).toHaveBeenCalledOnce();
  });
  expect(createRoot).toHaveBeenCalledWith(document.getElementById("root"));
});
