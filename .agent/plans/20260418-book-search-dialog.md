# 書籍検索ダイアログ：書名・著者名・出版社・ISBN対応

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds. This document must be maintained in accordance with `.agent/PLANS.md`.

## Purpose / Big Picture

Currently, users can only register books by typing an exact ISBN and pressing a search button. There is no way to search by title, author, or publisher.

After this change, users can open a "書籍を検索" dialog from the book-creation form. The dialog has four search fields — 書名, 著者名, 出版社, ISBN — and a backend selector (Google Books or NDL, defaulting to Google Books). Any combination of fields can be used. Selecting a result auto-fills the form's title, authors, and ISBN fields.

To see it working: open the app, click "本を追加", click "書籍を検索", type "Rust" in 書名, click 検索, pick a result, and observe the form fields fill in automatically.

## Progress

- [ ] Create `src/features/books/useBookSearch.ts` (new search hook)
- [ ] Create `src/features/books/useBookSearch.test.ts` (unit tests for the hook)
- [ ] Create `src/features/books/BookSearchDialog.tsx` (search dialog component)
- [ ] Create `src/features/books/BookSearchDialog.test.tsx` (unit tests for dialog)
- [ ] Modify `src/features/books/BookCreateForm.tsx` (add "書籍を検索" button, integrate dialog)
- [ ] Delete `src/features/books/useIsbnLookup.ts`
- [ ] Delete `src/features/books/useIsbnLookup.test.ts`
- [ ] Run all checks: `npm run generate && npm run test && npm run typecheck && npm run lint`

## Surprises & Discoveries

(none yet)

## Decision Log

- Decision: All search fields (書名, 著者名, 出版社, ISBN) are passed to the selected backend (Google Books or NDL). No special routing for ISBN.
  Rationale: Both Google Books and NDL support ISBN search natively. A unified backend-per-search model is simpler than routing by field type. The user clarified that openBD is not needed for the search dialog.
  Date/Author: 2026-04-18 / hiterm

- Decision: Support Google Books and NDL as selectable backends, defaulting to Google Books.
  Rationale: User preference to have both options available. Google Books is the default for wider coverage including foreign books. NDL offers superior coverage for Japanese books.
  Date/Author: 2026-04-18 / hiterm

- Decision: Use a modal dialog for the search UI, not inline autocomplete.
  Rationale: User preference. A dialog gives more space for results and avoids cluttering the main form.
  Date/Author: 2026-04-18 / hiterm

- Decision: The search dialog is added only to BookCreateForm, not BookUpdateForm.
  Rationale: User intent is book discovery at creation time, not editing existing records.
  Date/Author: 2026-04-18 / hiterm

- Decision: Search dialog has four separate fields in order — 書名, 著者名, 出版社, ISBN — plus a backend SegmentedControl and a 検索 button.
  Rationale: Field order is keyword-first since the primary new value of this dialog is keyword search; ISBN is placed last as a precise fallback. A button (not auto-search-on-type) avoids excessive API calls as the user fills multiple fields.
  Date/Author: 2026-04-18 / hiterm

- Decision: Author matching on select uses fuzzy normalization (collapse all whitespace + lowercase), then falls back to creating a pending author for any unmatched name.
  Rationale: API results may have spacing differences (e.g. "山田 太郎" vs "山田太郎"). Unmatched authors must become `{ id: "__pending__:{name}", name }` so `resolvePendingAuthors` creates them on form submit. Previously the code silently dropped unmatched authors.
  Date/Author: 2026-04-18 / hiterm

- Decision: The existing `useIsbnLookup.ts` is deleted entirely and replaced by `useBookSearch.ts`.
  Rationale: The new hook covers all use cases of the old one plus adds keyword search, making the old hook redundant.
  Date/Author: 2026-04-18 / hiterm

- Decision: `isbnUtils.ts` is kept but not used by `useBookSearch.ts`; ISBN is passed as plain text to the backend APIs without client-side validation.
  Rationale: Both backends handle malformed ISBNs gracefully by returning no results. Removing validation keeps the hook simpler.
  Date/Author: 2026-04-18 / hiterm

## Outcomes & Retrospective

(to be filled after completion)

## Context and Orientation

This is a React + TypeScript single-page application. The UI is built with Mantine 8 (a React component library). The book-creation flow works as follows:

1. The user clicks "本を追加" (`src/features/books/BookAddButton.tsx`), which opens a Mantine `Modal`.
2. Inside is `BookCreateForm` (`src/features/books/BookCreateForm.tsx`), a form with fields: title, authors, format, store, priority, ISBN, read, owned.
3. The form uses Mantine `useForm` with a Zod schema (`src/features/books/bookFormSchema.ts`) for validation.
4. Currently, an `ActionIcon` next to the ISBN field triggers `useIsbnLookup`, which calls NDL then Google Books as fallback and auto-fills title and authors.

**Key files:**
- `src/features/books/BookCreateForm.tsx` — form component to be modified
- `src/features/books/useIsbnLookup.ts` — to be deleted (replaced by `useBookSearch.ts`)
- `src/features/books/useIsbnLookup.test.ts` — to be deleted
- `src/features/books/isbnUtils.ts` — keep as-is; no longer used by the new hook but may be used elsewhere
- `src/features/books/AuthorsCombobox.tsx` — used in the form; author type from `src/features/books/entity/Author.ts`
- `src/compoments/hooks/useAuthors.ts` — React Query hook fetching all authors from GraphQL
- `src/features/books/bookFormSchema.ts` — Zod schema for form values
- `src/features/books/resolvePendingAuthors.ts` — called in `BookAddButton.tsx` on submit; creates authors whose id starts with `__pending__:` via GraphQL mutation

**API details:**

Google Books search (no proxy needed; supports CORS):

    GET https://www.googleapis.com/books/v1/volumes?q={query}&maxResults=10
    Response:
    { "items": [{ "volumeInfo": { "title": "...", "authors": ["..."], "publisher": "...",
        "industryIdentifiers": [{ "type": "ISBN_13", "identifier": "978..." }] } }] }

Build the `query` string from non-empty fields using Google Books operators:
- 書名: `intitle:{value}`
- 著者名: `inauthor:{value}`
- 出版社: `inpublisher:{value}`
- ISBN: `isbn:{value}` (strip hyphens first with `value.replace(/-/g, "")`)
- Join non-empty parts with `+`, then URL-encode the whole thing with `encodeURIComponent`.
- Example: `encodeURIComponent("intitle:Rust+inauthor:Blandy")`.

If `items` is absent or empty, no results. `industryIdentifiers` may be missing; default ISBN to `""`.

NDL search (uses the existing `/ndl-proxy/` reverse-proxy; returns XML):

    GET /ndl-proxy/api/opensearch?{params}
    Params (all optional, combine as needed):
      title={value}      — 書名
      creator={value}    — 著者名
      publisher={value}  — 出版社
      isbn={value}       — ISBN (strip hyphens first)

    Response: RSS/XML with <item> elements. Each item contains:
      <title>書名</title>
      <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">著者名</dc:creator>  (may repeat)
      <dc:identifier xmlns:dc="http://purl.org/dc/elements/1.1/">ISBN:9784...</dc:identifier>

The DC namespace URI is `http://purl.org/dc/elements/1.1/`. Parse using `DOMParser` and `getElementsByTagNameNS`. The `<dc:identifier>` text may be prefixed with `"ISBN:"` — strip that prefix. Multiple `<dc:creator>` elements represent multiple authors.

See existing `useIsbnLookup.ts` for reference NDL XML parsing code.

**Testing infrastructure:** Tests use Vitest and `@testing-library/react`. For hooks and components calling `fetch`, stub with `vi.stubGlobal("fetch", vi.fn())` in `beforeEach` and restore with `vi.unstubAllGlobals()` in `afterEach`. See `src/features/books/useIsbnLookup.test.ts` for the established pattern.

## Plan of Work

### Step 1 — Create `useBookSearch.ts`

Create `src/features/books/useBookSearch.ts`.

Define and export these types:

    export type BookSearchQuery = {
      isbn?: string;
      title?: string;
      authorName?: string;
      publisher?: string;
    };

    export type BookSearchBackend = "googleBooks" | "ndl";

    export type BookSearchResult = {
      title: string;
      authorNames: string[];
      isbn: string;
      publisher: string;
    };

    export type BookSearchState =
      | { status: "idle" }
      | { status: "loading" }
      | { status: "success"; results: BookSearchResult[] }
      | { status: "error"; message: string };

    export const useBookSearch = (): {
      state: BookSearchState;
      search: (query: BookSearchQuery, backend: BookSearchBackend) => Promise<void>;
    } => { ... };

The `search` function:
1. If all four fields are empty, set state to `idle` and return.
2. Set state to `loading`.
3. Call `searchGoogleBooks(query)` or `searchNdl(query)` based on `backend`.
4. On success, set `{ status: "success", results }`.
5. Wrap in try/catch; on error set `{ status: "error", message: "取得に失敗しました" }`.
6. Use a `latestRequestIdRef` to discard stale responses (same pattern as `useIsbnLookup.ts`).

`searchGoogleBooks(query: BookSearchQuery): Promise<BookSearchResult[]>`:
- Build query parts array. For each non-empty field: 書名 → `intitle:{title}`, 著者名 → `inauthor:{authorName}`, 出版社 → `inpublisher:{publisher}`, ISBN → `isbn:{isbn.replace(/-/g, "")}`.
- Combine: `encodeURIComponent(parts.join("+"))`.
- Fetch `https://www.googleapis.com/books/v1/volumes?q={encoded}&maxResults=10`.
- If `response.ok` is false, throw an error.
- Parse JSON. If `items` is absent, return `[]`.
- Map each item: `title` from `volumeInfo.title`, `authorNames` from `volumeInfo.authors ?? []`, `isbn` from `industryIdentifiers` (find `type === "ISBN_13"`, default `""`), `publisher` from `volumeInfo.publisher ?? ""`.
- Filter out items where `title` is falsy.

`searchNdl(query: BookSearchQuery): Promise<BookSearchResult[]>`:
- Build `URLSearchParams` adding only non-empty fields: `title`, `creator` (from authorName), `publisher`, `isbn` (strip hyphens).
- Fetch `/ndl-proxy/api/opensearch?${params}`.
- If `response.ok` is false, throw an error.
- Parse text as XML via `DOMParser`. Query all `<item>` elements.
- For each item: title from `item.querySelector("title")?.textContent ?? ""`, authors from `Array.from(item.getElementsByTagNameNS(DC_NS, "creator")).map(el => el.textContent?.trim() ?? "").filter(Boolean)`, ISBN from the `dc:identifier` element whose text starts with `"ISBN:"` (strip the `"ISBN:"` prefix), publisher from `getElementsByTagNameNS(DC_NS, "publisher")[0]?.textContent?.trim() ?? ""`.
- Filter out items where title is empty.

The Dublin Core namespace constant: `const DC_NS = "http://purl.org/dc/elements/1.1/"`.

### Step 2 — Create `useBookSearch.test.ts`

Create `src/features/books/useBookSearch.test.ts`. Use `vi.stubGlobal("fetch", vi.fn())` / `vi.unstubAllGlobals()` in `beforeEach`/`afterEach`. Write tests for:

- Initial state is `idle`.
- All-empty query sets state back to `idle` without fetching.
- Google Books search with title builds `intitle:` query and returns correct results.
- Google Books search with ISBN builds `isbn:` query (hyphens stripped).
- Google Books returning no `items` → `success` with empty results.
- NDL search with title sends `title` param and parses XML correctly.
- NDL search with ISBN sends `isbn` param (hyphens stripped).
- HTTP error → `error` with message "取得に失敗しました".
- Network failure → `error`.
- Stale response is discarded when a newer search completes first.

### Step 3 — Create `BookSearchDialog.tsx`

Create `src/features/books/BookSearchDialog.tsx`.

Props:

    type BookSearchDialogProps = {
      opened: boolean;
      onClose: () => void;
      onSelect: (result: BookSearchResult) => void;
    };

Layout inside the Mantine `Modal` (title: "書籍を検索"):

    Stack:
      SegmentedControl
        value: backend ("googleBooks" | "ndl"), default "googleBooks"
        data: [{ value: "googleBooks", label: "Google Books" }, { value: "ndl", label: "NDL（国立国会図書館）" }]
      TextInput  label="書名"
      TextInput  label="著者名"
      TextInput  label="出版社"
      TextInput  label="ISBN"
      Button "検索"  onClick → call search(query, backend); disabled when all four fields are empty
      [results area]

The results area:
- `state.status === "loading"` → `<Loader />`
- `state.status === "error"` → `<Text c="red">{state.message}</Text>`
- `state.status === "success" && results.length === 0` → `<Text>見つかりませんでした</Text>`
- `state.status === "success" && results.length > 0` → scrollable list of result rows

Each result row uses `UnstyledButton` or `Paper` showing:
- Title (bold)
- Authors joined with "、"
- Publisher and ISBN on a secondary line (smaller, dimmed color)

Clicking a row calls `onSelect(result)` and `onClose()`.

### Step 4 — Create `BookSearchDialog.test.tsx`

Create `src/features/books/BookSearchDialog.test.tsx`. Use `vi.stubGlobal("fetch", vi.fn())` / `vi.unstubAllGlobals()`. Write tests for:

- Dialog renders four TextInputs and a SegmentedControl when open.
- 検索 button is disabled when all fields are empty.
- Clicking 検索 with a title value triggers the search and shows results.
- Clicking a result calls `onSelect` with the correct `BookSearchResult`.
- Error state shows error text.
- Empty results show "見つかりませんでした".
- Switching SegmentedControl to NDL and clicking 検索 calls the NDL endpoint.

### Step 5 — Modify `BookCreateForm.tsx`

In `src/features/books/BookCreateForm.tsx`:

1. Remove `useIsbnLookup` import and all its usage (state, handler, ActionIcon, error text, surrounding `Group` and `Stack`).
2. Add `const [searchOpened, setSearchOpened] = useState(false)`.
3. Add a `Button` labeled "書籍を検索" near the top of the form (above the 書名 TextInput is recommended). On click: `setSearchOpened(true)`.
4. Keep the ISBN `TextInput` as-is for manual entry.
5. Add `<BookSearchDialog>` inside the returned JSX:

        <BookSearchDialog
          opened={searchOpened}
          onClose={() => setSearchOpened(false)}
          onSelect={(result) => {
            form.setFieldValue("title", result.title);
            form.setFieldValue("isbn", result.isbn);
            const normalize = (s: string) => s.replace(/\s+/g, "").toLowerCase();
            const resolvedAuthors = result.authorNames.map((name) => {
              const existing = data.authors.find(
                (a) =>
                  a.name.trim().toLowerCase() === name.trim().toLowerCase() ||
                  normalize(a.name) === normalize(name),
              );
              return existing ?? { id: `__pending__:${name}`, name };
            });
            const uniqueAuthors = Array.from(
              new Map(resolvedAuthors.map((a) => [a.id, a])).values(),
            );
            form.setFieldValue("authors", uniqueAuthors);
            setSearchOpened(false);
          }}
        />

`data` comes from the existing `useAuthors()` call in the component. Author matching logic:
- First try exact case-insensitive match: `a.name.trim().toLowerCase() === name.trim().toLowerCase()`.
- Then try fuzzy match by collapsing all whitespace: `normalize(a.name) === normalize(name)`.
- If still no match: create pending author `{ id: "__pending__:{name}", name }`.
- Deduplicate by id using a `Map`.

All authors are set (never silently dropped). Pending authors are created via GraphQL by the existing `resolvePendingAuthors` call in `BookAddButton.tsx` at form submit time.

### Step 6 — Delete old files

    git rm src/features/books/useIsbnLookup.ts
    git rm src/features/books/useIsbnLookup.test.ts

## Concrete Steps

All commands run from the repository root (`/home/hiterm/ghq/github.com/hiterm/bookshelf`).

    # 1. Create useBookSearch.ts and useBookSearch.test.ts
    # 2. Create BookSearchDialog.tsx and BookSearchDialog.test.tsx
    # 3. Edit BookCreateForm.tsx
    # 4. Delete old files
    git rm src/features/books/useIsbnLookup.ts
    git rm src/features/books/useIsbnLookup.test.ts

    # 5. Run all pre-commit checks
    npm run generate
    npm run test
    npm run typecheck
    npm run lint

All four commands must exit 0 before committing.

Commit in logical units:
1. Add `useBookSearch.ts` + `useBookSearch.test.ts`
2. Add `BookSearchDialog.tsx` + `BookSearchDialog.test.tsx`
3. Modify `BookCreateForm.tsx` + delete `useIsbnLookup.ts` + `useIsbnLookup.test.ts`

## Validation and Acceptance

Run tests:

    npm run test

Expected: all existing tests pass, new tests in `useBookSearch.test.ts` and `BookSearchDialog.test.tsx` pass, deleted test file is gone.

Run the development server:

    npm run dev

Verify these scenarios manually (app typically at `http://localhost:5173`):

Scenario A — Google Books title search:
1. Open "本を追加" form, click "書籍を検索".
2. Type "Rust プログラミング" in 書名. Click 検索.
3. Results appear with titles, authors, ISBNs.
4. Click a result: dialog closes, form fills in.

Scenario B — NDL search:
1. Open dialog, switch SegmentedControl to "NDL（国立国会図書館）".
2. Type "プログラミング" in 書名. Click 検索.
3. Results from NDL appear.

Scenario C — ISBN search via Google Books:
1. Open dialog (Google Books selected), type `9784065362433` in ISBN. Click 検索.
2. Results appear.

Scenario D — Not found:
1. Open dialog, type a nonsense query. Click 検索.
2. "見つかりませんでした" shown.

Scenario E — Manual ISBN entry:
1. Without using the dialog, type an ISBN directly into the form's ISBN field and submit.
2. Submission succeeds with the manually entered ISBN.

## Idempotence and Recovery

New files are additive; delete and recreate freely. `BookCreateForm.tsx` is recoverable via `git checkout src/features/books/BookCreateForm.tsx`. Deleted files are recoverable via `git checkout` before the deletion commit.

## Artifacts and Notes

NDL XML example (abbreviated):

    <rss xmlns:dc="http://purl.org/dc/elements/1.1/">
      <channel>
        <item>
          <title>プログラミングRust 第2版</title>
          <dc:creator>Jim Blandy</dc:creator>
          <dc:creator>Jason Orendorff</dc:creator>
          <dc:identifier>ISBN:9784065362433</dc:identifier>
        </item>
      </channel>
    </rss>

## Interfaces and Dependencies

In `src/features/books/useBookSearch.ts`:

    export type BookSearchQuery = { isbn?: string; title?: string; authorName?: string; publisher?: string; };
    export type BookSearchBackend = "googleBooks" | "ndl";
    export type BookSearchResult = { title: string; authorNames: string[]; isbn: string; publisher: string; };
    export type BookSearchState =
      | { status: "idle" }
      | { status: "loading" }
      | { status: "success"; results: BookSearchResult[] }
      | { status: "error"; message: string };
    export const useBookSearch = (): { state: BookSearchState; search: (query: BookSearchQuery, backend: BookSearchBackend) => Promise<void> } => { ... };

In `src/features/books/BookSearchDialog.tsx`:

    import { BookSearchResult } from "./useBookSearch";
    type BookSearchDialogProps = { opened: boolean; onClose: () => void; onSelect: (result: BookSearchResult) => void; };
    export const BookSearchDialog: React.FC<BookSearchDialogProps> = (...) => { ... };

Dependencies:
- `useBookSearch` from `./useBookSearch`
- Mantine `Modal`, `SegmentedControl`, `TextInput`, `Button`, `Stack`, `Text`, `Loader`, `UnstyledButton` from `@mantine/core`
