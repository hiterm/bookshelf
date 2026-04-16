# Add author creation from book form

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

Refer to `.agent/PLANS.md` for the full requirements this document must satisfy.


## Purpose / Big Picture

Currently, when a user edits or creates a book and cannot find the desired author in the author selection field, they must navigate away to the `/authors` page, create the author there, and come back to the book form. This is disruptive.

After this change, users will be able to type an author name in the author field of the book form. If no existing author matches, a "+ Create <name>" option will appear in the dropdown. Selecting it marks the author as "pending" (no API call yet). When the user submits the book form (either "Save" in the edit view or "追加" in the add modal), any pending authors are created via the GraphQL `createAuthor` mutation first, and then the book is saved with the resulting real author IDs.

To see it working: open a book's edit page (`/books/:id/edit`) or the book-add modal on `/books/`. Type a new author name in the author field. Select "+ Create <name>". The author appears as a pill. Press Save / 追加. The book is saved and the new author now exists.


## Progress

- [x] (2026-04-17) Create feature branch `feature/add-author-from-book-form`
- [ ] Replace `MultiSelect` author field in `BookForm.tsx` with a Combobox-based creatable component
- [ ] Create `src/features/books/resolvePendingAuthors.ts`
- [ ] Update `BookDetailEdit.tsx` to resolve pending authors before calling `updateBook`
- [ ] Update `BookAddButton.tsx` to resolve pending authors before calling `createBook`
- [ ] Update `BookForm.test.tsx` (mock `useCreateAuthor` if needed; verify existing tests pass)
- [ ] Run `npm run test && npm run typecheck && npm run lint` and fix any issues
- [ ] Commit


## Surprises & Discoveries

(none yet)


## Decision Log

- Decision: Use Mantine `Combobox` primitives (`useCombobox`, `Combobox`, `PillsInput`, `Pill`) instead of `MultiSelect` with a `filter` trick.
  Rationale: The official Mantine MultiSelectCreatable example uses Combobox primitives. This is the documented, stable approach for creatable multi-selects in Mantine 7/8. Using `MultiSelect` with synthetic `__create__:` values in the `filter` prop would be fragile and undocumented.
  Date/Author: 2026-04-17

- Decision: Defer author creation to form submit time ("deferred creation"), not at the moment the user selects the "+ Create" option.
  Rationale: The user requested that pressing the book save button creates authors and saves the book together. Immediate creation on selection would create orphan authors if the user abandons the form.
  Date/Author: 2026-04-17

- Decision: Represent pending (not-yet-created) authors as `{ id: '__pending__:<name>', name: '<name>' }` in the form state.
  Rationale: This piggybacks on the existing `Author` type without schema changes. The `__pending__:` prefix is unique enough to distinguish from real UUIDs. The prefix is stripped and replaced with the real ID in `resolvePendingAuthors` at submit time.
  Date/Author: 2026-04-17


## Outcomes & Retrospective

(not yet completed)


## Context and Orientation

This is a React + TypeScript frontend project. The UI library is Mantine 8 (`@mantine/core` 8.3.18). Server state is managed with React Query (`@tanstack/react-query` 5). The GraphQL client is `graphql-request` with generated typed SDK in `src/generated/graphql-request.ts`.

Key files:

- `src/features/books/BookForm.tsx` — A custom hook `useBookForm` that renders the entire book form as a `ReactElement` and returns it together with a `submitForm` handler. The author field is currently a Mantine `MultiSelect`. This is the file where the creatable author field will be implemented.

- `src/features/books/BookDetailEdit.tsx` — The book edit page component. Uses `useBookForm` and calls `useUpdateBook` on submit. This must be updated to resolve pending authors before calling `updateBook`.

- `src/features/books/BookAddButton.tsx` — The book creation modal component. Uses `useBookForm` and calls `useCreateBook` on submit. This must also be updated to resolve pending authors.

- `src/compoments/hooks/useCreateAuthor.ts` — A React Query mutation hook that calls the `createAuthor` GraphQL mutation and invalidates the `["authors"]` query cache. Returns `{ mutateAsync, isPending, ... }`. The `mutateAsync` function takes `{ name: string }` and returns `{ createAuthor: { id: string } }`.

- `src/compoments/hooks/useAuthors.ts` — A React Query query hook that fetches all authors. Returns `{ data: { authors: Author[] }, isLoading, error }`.

- `src/features/books/entity/Author.ts` — The `Author` type: `{ id: string; name: string }`.

- `src/features/books/BookForm.test.tsx` — Vitest unit tests for `useBookForm`. Currently mocks `useAuthors`. Will need to also mock `useCreateAuthor` once it is imported by `BookForm.tsx`.

The Mantine Combobox API (relevant to this plan):

  `useCombobox(options)` — creates a combobox store. Options include `onDropdownClose` and `onDropdownOpen` callbacks.

  `<Combobox store={...} onOptionSubmit={handler}>` — wraps the entire combobox. `onOptionSubmit` receives the `value` string of the selected option.

  `<Combobox.DropdownTarget>` — wraps the trigger element (the input).

  `<PillsInput label="..." error={...}>` — a text input that renders pills inside it. Acts as the visible input for the combobox.

  `<Pill.Group>` — container for pills inside `PillsInput`.

  `<Pill withRemoveButton onRemove={...}>` — a removable pill (chip).

  `<Combobox.EventsTarget>` — wraps the actual text field inside `PillsInput`.

  `<PillsInput.Field>` — the text input element. Accepts `value`, `onChange`, `onFocus`, `onBlur`, `onKeyDown`.

  `<Combobox.Dropdown>` — the dropdown container.

  `<Combobox.Options>` — the options list container.

  `<Combobox.Option value="...">` — a single option. The `value` string is passed to `onOptionSubmit`.

  `<CheckIcon size={12} />` — imported from `@mantine/core`, used to mark active (already-selected) options.


## Plan of Work

### Step 1 — Replace the author field in `BookForm.tsx`

File: `src/features/books/BookForm.tsx`

Add the following imports (merge with existing import from `@mantine/core`):

    CheckIcon, Combobox, Group, Pill, PillsInput, useCombobox

Add to the React import: `useState`.

Add a new import at the top:

    import { useCreateAuthor } from '../../compoments/hooks/useCreateAuthor';

Note: `useCreateAuthor` is imported here only so that `BookForm.test.tsx` can mock it without changing anything else. `BookForm.tsx` does NOT call it; the pending author resolution happens in `BookDetailEdit` and `BookAddButton`.

Wait — actually `BookForm.tsx` does NOT need to import `useCreateAuthor` at all. Pending authors are represented as `{ id: '__pending__:<name>', name }` in the form state, and the actual creation is done by the callers. `BookForm.tsx` only needs `useState` and the Combobox imports.

Inside `useBookForm`, after the existing `useAuthors` call, add:

    const [authorSearch, setAuthorSearch] = useState('');

    const combobox = useCombobox({
      onDropdownClose: () => combobox.resetSelectedOption(),
      onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
    });

    const exactAuthorMatch = data.authors.some(
      (a) => a.name === authorSearch,
    );

    const handleAuthorSelect = (val: string) => {
      setAuthorSearch('');
      if (val === '$create') {
        const name = authorSearch;
        form.setFieldValue('authors', [
          ...form.values.authors,
          { id: `__pending__:${name}`, name },
        ]);
      } else {
        const already = form.values.authors.some((a) => a.id === val);
        if (already) {
          form.setFieldValue(
            'authors',
            form.values.authors.filter((a) => a.id !== val),
          );
        } else {
          const author = data.authors.find((a) => a.id === val);
          if (author) {
            form.setFieldValue('authors', [...form.values.authors, author]);
          }
        }
      }
    };

    const handleAuthorRemove = (id: string) => {
      form.setFieldValue(
        'authors',
        form.values.authors.filter((a) => a.id !== id),
      );
    };

Replace the `<MultiSelect ... />` JSX block (currently lines 135–153) with:

    <Combobox store={combobox} onOptionSubmit={handleAuthorSelect}>
      <Combobox.DropdownTarget>
        <PillsInput
          label="著者"
          onClick={() => combobox.openDropdown()}
          error={form.errors.authors as string | undefined}
        >
          <Pill.Group>
            {form.values.authors.map((author) => (
              <Pill
                key={author.id}
                withRemoveButton
                onRemove={() => handleAuthorRemove(author.id)}
              >
                {author.name}
              </Pill>
            ))}
            <Combobox.EventsTarget>
              <PillsInput.Field
                onFocus={() => combobox.openDropdown()}
                onBlur={() => combobox.closeDropdown()}
                value={authorSearch}
                placeholder="著者を検索"
                onChange={(e) => {
                  combobox.updateSelectedOptionIndex();
                  setAuthorSearch(e.currentTarget.value);
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === 'Backspace' &&
                    authorSearch.length === 0 &&
                    form.values.authors.length > 0
                  ) {
                    e.preventDefault();
                    handleAuthorRemove(
                      form.values.authors[form.values.authors.length - 1].id,
                    );
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Options>
          {data.authors
            .filter((a) =>
              a.name.toLowerCase().includes(authorSearch.trim().toLowerCase()),
            )
            .map((author) => (
              <Combobox.Option
                value={author.id}
                key={author.id}
                active={form.values.authors.some((a) => a.id === author.id)}
              >
                <Group gap="sm">
                  {form.values.authors.some((a) => a.id === author.id) && (
                    <CheckIcon size={12} />
                  )}
                  <span>{author.name}</span>
                </Group>
              </Combobox.Option>
            ))}

          {!exactAuthorMatch && authorSearch.trim().length > 0 && (
            <Combobox.Option value="$create">
              + Create {authorSearch}
            </Combobox.Option>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>

Remove `MultiSelect` from the `@mantine/core` import line (it is no longer used). Keep all other existing imports.

The `bookFormSchema` Zod schema already validates `authors` as `z.array(z.object({ id: z.string(), name: z.string() })).nonempty()`. The `__pending__:` prefix is a plain string so validation passes unchanged.


### Step 3 — Create `resolvePendingAuthors.ts`

Create a new file `src/features/books/resolvePendingAuthors.ts`:

    import type { Author } from './entity/Author';

    export const resolvePendingAuthors = async (
      authors: Author[],
      createAuthor: (name: string) => Promise<string>,
    ): Promise<Author[]> => {
      return Promise.all(
        authors.map(async (author) => {
          if (author.id.startsWith('__pending__:')) {
            const id = await createAuthor(author.name);
            return { id, name: author.name };
          }
          return author;
        }),
      );
    };

`Author` is `{ id: string; name: string }` from `src/features/books/entity/Author.ts`.

`createAuthor` is an async callback that creates one author by name and returns its real ID (a string). This keeps the utility free of any React hooks, making it easy to unit-test independently.


### Step 4 — Update `BookDetailEdit.tsx`

File: `src/features/books/BookDetailEdit.tsx`

Add imports:

    import { useCreateAuthor } from '../../compoments/hooks/useCreateAuthor';
    import { resolvePendingAuthors } from './resolvePendingAuthors';

Inside the `BookDetailEdit` component, after the existing hook calls, add:

    const createAuthorMutation = useCreateAuthor();

Replace the `handleSubmit` function body with:

    const handleSubmit = async (values: BookFormValues) => {
      const resolvedAuthors = await resolvePendingAuthors(
        values.authors,
        async (name) => {
          const result = await createAuthorMutation.mutateAsync({ name });
          return result.createAuthor.id;
        },
      );
      const bookData = {
        id: book.id,
        title: values.title,
        isbn: values.isbn,
        read: values.read,
        owned: values.owned,
        priority: values.priority,
        format: values.format,
        store: values.store,
        authorIds: resolvedAuthors.map((a) => a.id),
      };
      await updateBookMutation.mutateAsync(bookData);
      await navigate({ to: `/books/$id`, params: { id: book.id } });
      showNotification({ message: '更新しました', color: 'teal' });
    };


### Step 5 — Update `BookAddButton.tsx`

File: `src/features/books/BookAddButton.tsx`

Add imports:

    import { useCreateAuthor } from '../../compoments/hooks/useCreateAuthor';
    import { resolvePendingAuthors } from './resolvePendingAuthors';

Inside `BookAddButton`, after the `createBookMutation` hook call, add:

    const createAuthorMutation = useCreateAuthor();

Replace the `submitBook` function body with:

    const submitBook = async (value: BookFormValues) => {
      if (createBookMutation.isPending) return;
      const resolvedAuthors = await resolvePendingAuthors(
        value.authors,
        async (name) => {
          const result = await createAuthorMutation.mutateAsync({ name });
          return result.createAuthor.id;
        },
      );
      const { authors: _authors, ...rest } = value;
      const bookData = {
        ...rest,
        authorIds: resolvedAuthors.map((a) => a.id),
      };
      try {
        const result = await createBookMutation.mutateAsync(bookData);
        setOpen(false);
        showNotification({
          message: (
            <>
              <div>{value.title}を追加しました</div>
              <LinkButton
                linkOptions={{
                  to: '/books/$id',
                  params: { id: result.createBook.id },
                }}
              >
                Move
              </LinkButton>
            </>
          ),
          color: 'teal',
        });
      } catch (error) {
        showNotification({
          message: `Failed to create book: ${String(error)}`,
          color: 'red',
        });
      }
    };


### Step 6 — Update `BookForm.test.tsx`

The test file mocks `useAuthors` but not `useCreateAuthor`. Since `BookForm.tsx` no longer imports `useCreateAuthor`, no additional mock is needed for that hook in `BookForm.test.tsx`.

However, the existing test "renders all form fields" checks for `著者` by role. After the change, the author field is no longer a `MultiSelect` but a `PillsInput`. Verify the test still finds the label "著者" — Mantine's `PillsInput` renders a `<label>著者</label>` which should be discoverable via `findByLabelText` or similar. If any test breaks, fix it to query the field in a way consistent with the new Combobox-based component.

The test for `combobox` (portals) in Mantine may require `userEvent` interactions; refer to `CLAUDE.md` for Mantine testing docs links if needed.


### Step 7 — Run checks and commit

From the repository root, run:

    npm run test
    npm run typecheck
    npm run lint

Fix any errors. Then commit:

    git add src/features/books/BookForm.tsx \
            src/features/books/resolvePendingAuthors.ts \
            src/features/books/BookDetailEdit.tsx \
            src/features/books/BookAddButton.tsx \
            src/features/books/BookForm.test.tsx
    git commit -m "Add author creation from book form"


## Concrete Steps

All commands run from `/home/hiterm/ghq/github.com/hiterm/bookshelf`.

    git switch -c feature/add-author-from-book-form

Edit files as described in Plan of Work above.

    npm run test
    # Expected: all existing tests pass; no new failures

    npm run typecheck
    # Expected: no TypeScript errors

    npm run lint
    # Expected: no ESLint or Biome warnings/errors

    git add <files>
    git commit -m "Add author creation from book form"


## Validation and Acceptance

Start the dev server (`npm start`) and open the app in a browser.

Scenario A — Book edit:
1. Navigate to an existing book's edit page (`/books/:id/edit`).
2. In the "著者" field, type a name that does not exist (e.g., "テスト著者").
3. The dropdown shows "+ Create テスト著者".
4. Click it. The name appears as a pill in the author field.
5. Press "Save". The book saves successfully and navigates to the book detail page.
6. Navigate to `/authors` and confirm "テスト著者" now appears in the author list.

Scenario B — Book add:
1. Click the "追加" button on `/books/`.
2. In the author field, type a name that does not exist.
3. The dropdown shows "+ Create <name>".
4. Select it. The pill appears.
5. Fill in a title and press "追加". The book is created and a success notification appears.
6. Navigate to `/authors` and confirm the new author exists.

Scenario C — Existing author:
1. In either form, type an existing author's name.
2. Confirm the "+ Create" option does NOT appear, only the existing author option.

Scenario D — Tests:
    npm run test
All tests pass.


## Idempotence and Recovery

Each file edit is a direct replacement; re-applying the same change is safe. If `npm run test` fails, read the error output, fix the relevant file, and re-run. No database migrations or destructive operations are involved.


## Artifacts and Notes

Official Mantine MultiSelectCreatable example (provided by user, Mantine 8 compatible):

    import { CheckIcon, Combobox, Group, Pill, PillsInput, useCombobox } from '@mantine/core';

    const groceries = ['🍎 Apples', '🍌 Bananas', ...];

    export function MultiSelectCreatable() {
      const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
        onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
      });
      const [search, setSearch] = useState('');
      const [data, setData] = useState(groceries);
      const [value, setValue] = useState<string[]>([]);
      const exactOptionMatch = data.some((item) => item === search);

      const handleValueSelect = (val: string) => {
        setSearch('');
        if (val === '$create') {
          setData((current) => [...current, search]);
          setValue((current) => [...current, search]);
        } else {
          setValue((current) =>
            current.includes(val) ? current.filter((v) => v !== val) : [...current, val]
          );
        }
      };
      // ... PillsInput + Combobox JSX as shown in the official example
    }

Key adaptation for this project: instead of `setValue` directly with the search string, we set `form.values.authors` with `{ id: '__pending__:<name>', name }` and defer the actual `createAuthor` API call to submit time.


## Interfaces and Dependencies

In `src/features/books/resolvePendingAuthors.ts`, export:

    export const resolvePendingAuthors: (
      authors: Author[],
      createAuthor: (name: string) => Promise<string>,
    ) => Promise<Author[]>

Where `Author` is `import type { Author } from './entity/Author'` (the type `{ id: string; name: string }`).

In `src/compoments/hooks/useCreateAuthor.ts` (unchanged), the existing hook returns:

    {
      mutateAsync: (input: { name: string }) => Promise<{ createAuthor: { id: string } }>,
      isPending: boolean,
      // ...other React Query mutation fields
    }

New Mantine imports used in `BookForm.tsx`:

    CheckIcon, Combobox, Group, Pill, PillsInput, useCombobox  — from '@mantine/core'
    useState  — from 'react'

`MultiSelect` is removed from `BookForm.tsx` imports after this change.
