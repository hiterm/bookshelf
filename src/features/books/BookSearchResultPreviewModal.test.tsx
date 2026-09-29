import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { BookSearchResultPreviewModal } from "./BookSearchResultPreviewModal";
import type { BookLookupResult } from "./useBookLookup";

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  vi.stubGlobal("fetch", vi.fn());
  vi.spyOn(console, "debug").mockImplementation(() => undefined);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
const searchResult: BookLookupResult = {
  title: "Search result",
  isbn: "9784065362433",
  authorNames: ["Author"],
  publisher: "Publisher",
};

test("allows selecting the original search result after details fail", async () => {
  vi.mocked(fetch).mockResolvedValue(
    new Response("Unavailable", { status: 503 }),
  );
  const onSelect = vi.fn();
  const onClose = vi.fn();
  render(
    <MantineProvider>
      <BookSearchResultPreviewModal
        opened
        onClose={onClose}
        onSelect={onSelect}
        searchResult={searchResult}
      />
    </MantineProvider>,
  );
  expect(
    await screen.findByText("詳細情報を取得できませんでした"),
  ).toBeInTheDocument();
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "この本で選択" }));
  expect(onSelect).toHaveBeenCalledExactlyOnceWith(searchResult);
  expect(onClose).toHaveBeenCalledTimes(1);
});

test("closing clears details before reopening a result without an ISBN", async () => {
  vi.mocked(fetch).mockResolvedValue(
    new Response(
      JSON.stringify([
        {
          onix: {
            CollateralDetail: {
              TextContent: [{ TextType: "03", Text: "Old description" }],
            },
          },
        },
      ]),
    ),
  );
  const props = { onClose: vi.fn(), onSelect: vi.fn(), searchResult };
  const { rerender } = render(
    <MantineProvider>
      <BookSearchResultPreviewModal {...props} opened />
    </MantineProvider>,
  );
  expect(await screen.findByText("Old description")).toBeInTheDocument();
  rerender(
    <MantineProvider>
      <BookSearchResultPreviewModal {...props} opened={false} />
    </MantineProvider>,
  );
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  rerender(
    <MantineProvider>
      <BookSearchResultPreviewModal
        {...props}
        searchResult={{ ...searchResult, title: "No ISBN", isbn: "" }}
        opened
      />
    </MantineProvider>,
  );
  expect(
    await screen.findByRole("dialog", { name: "No ISBN" }),
  ).toBeInTheDocument();
  expect(screen.queryByText("Old description")).not.toBeInTheDocument();
  expect(fetch).toHaveBeenCalledTimes(1);
});
