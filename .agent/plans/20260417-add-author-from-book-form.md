# Add author creation from book form

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

Refer to `.agent/PLANS.md` for the full requirements this document must satisfy.


## Purpose / Big Picture

Currently, when a user edits or creates a book and cannot find the desired author in the author selection field, they must navigate away to the `/authors` page, create the author there, and come back to the book form. This is disruptive.

After this change, users will be able to type an author name in the author field of the book form. If no existing author matches, a "+ Create <name>" option will appear in the dropdown. Selecting it marks the author as "pending" (no API call yet). When the user submits the book form (either "Save" in the edit view or "追加" in the add modal), any pending authors are created via the GraphQL `createAuthor` mutation first, and then the book is saved with the resulting real author IDs.

To see it working: open a book's edit page (`/books/:id/edit`) or the book-add modal on `/books/`. Type a new author name in the author field. Select "+ Create <name>". The author appears as a pill. Press Save / 追加. The book is saved and the new author now exists.


## Progress

- [x] (2026-04-17) Create feature branch `feature/add-author-from-book-form`
- [x] (2026-04-17) Rebase onto main (BookForm split refactor merged)
- [x] (2026-04-17) Replace `MultiSelect` author field in `BookUpdateForm.tsx` with a Combobox-based creatable component
- [x] (2026-04-17) Replace `MultiSelect` author field in `BookCreateForm.tsx` with a Combobox-based creatable component
- [x] (2026-04-17) Create `src/features/books/resolvePendingAuthors.ts`
- [x] (2026-04-17) Update `BookDetailEdit.tsx` to resolve pending authors before calling `updateBook`
- [x] (2026-04-17) Update `BookAddButton.tsx` to resolve pending authors before calling `createBook`
- [x] (2026-04-17) Update `BookForm.test.tsx` (mock `useCreateAuthor` if needed; verify existing tests pass)
- [x] (2026-04-17) Run `npm run test && npm run typecheck && npm run lint` and fix any issues
- [x] (2026-04-17) Commit


## Surprises & Discoveries

- (2026-04-17) After rebasing, `BookForm.tsx` (the old custom hook `useBookForm`) no longer exists. It was split into two pure UI components: `BookCreateForm.tsx` and `BookUpdateForm.tsx`. Both receive a `form: UseFormReturnType<BookFormValues>` prop. The Combobox replacement must be applied to both files independently.


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

- Decision: Apply the Combobox replacement to both `BookCreateForm.tsx` and `BookUpdateForm.tsx` independently (not a shared component).
  Rationale: The two forms already differ (BookCreateForm has ISBN lookup, BookUpdateForm does not). Extracting a shared creatable-author component adds indirection; keeping them separate is consistent with the split refactor on main.
  Date/Author: 2026-04-17

- Decision: Use type narrowing (`typeof form.errors.authors === 'string' ? form.errors.authors : undefined`) instead of `as string | undefined`.
  Rationale: CLAUDE.md now prohibits `as` type assertions (added in the refactor-form PR merged to main).
  Date/Author: 2026-04-17


## Outcomes & Retrospective

Completed 2026-04-17. All 5 files modified as planned; `resolvePendingAuthors.ts` created. No test changes were needed — existing tests passed without mocking `useCreateAuthor` (pending author resolution is in `BookDetailEdit`/`BookAddButton`, not the form components). Two rounds of linter fixes were needed: ESLint required braces on void-returning arrow functions, and Biome then reformatted those to multi-line style.


## Context and Orientation

This is a React + TypeScript frontend project. The UI library is Mantine 8 (`@mantine/core` 8.3.18). Server state is managed with React Query (`@tanstack/react-query` 5). The GraphQL client is `graphql-request` with generated typed SDK in `src/generated/graphql-request.ts`.

Key files:

- `src/features/books/BookUpdateForm.tsx` — Pure UI component for the book edit form. Receives `form: UseFormReturnType<BookFormValues>`. The author field is currently a Mantine `MultiSelect`. Used by `BookDetailEdit.tsx`.

- `src/features/books/BookCreateForm.tsx` — Pure UI component for the book creation form. Receives `form: UseFormReturnType<BookFormValues>`. Also contains ISBN lookup logic. The author field is currently a Mantine `MultiSelect`. Used by `BookAddButton.tsx`.

- `src/features/books/BookDetailEdit.tsx` — The book edit page component. Manages `useForm` state and calls `useUpdateBook` on submit. Must be updated to resolve pending authors before calling `updateBook`.

- `src/features/books/BookAddButton.tsx` — The book creation modal component. Manages `useForm` state and calls `useCreateBook` on submit. Must also be updated to resolve pending authors.

- `src/compoments/hooks/useCreateAuthor.ts` — A React Query mutation hook that calls the `createAuthor` GraphQL mutation and invalidates the `["authors"]` query cache. Returns `{ mutateAsync, isPending, ... }`. The `mutateAsync` function takes `{ name: string }` and returns `{ createAuthor: { id: string } }`.

- `src/compoments/hooks/useAuthors.ts` — A React Query query hook that fetches all authors. Returns `{ data: { authors: Author[] }, isLoading, error }`.

- `src/features/books/entity/Author.ts` — The `Author` type: `{ id: string; name: string }`.

- `src/features/books/BookForm.test.tsx` — Vitest unit tests for `BookUpdateForm`. Currently mocks `useAuthors`. Will need to also mock `useCreateAuthor` once the Combobox component imports it (it does not; see Step 1 note).

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

The Combobox replacement logic is identical in both `BookUpdateForm.tsx` and `BookCreateForm.tsx`. Steps 1 and 2 below describe the change; apply it to each file.

### Step 1 — Replace the author field in `BookUpdateForm.tsx`

File: `src/features/books/BookUpdateForm.tsx`

Add the following to the imports from `@mantine/core` (merge with the existing import):

    CheckIcon, Combobox, Group, Pill, PillsInput, useCombobox

Add `useState` to the React import (currently `import React from 'react'` — change to `import React, { useState } from 'react'`).

Remove `MultiSelect` from the `@mantine/core` import (it is no longer used).

Inside `BookUpdateForm`, after the `useAuthors` call, add:

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

Replace the `<MultiSelect ... />` JSX block with:

    <Combobox store={combobox} onOptionSubmit={handleAuthorSelect}>
      <Combobox.DropdownTarget>
        <PillsInput
          label="著者"
          onClick={() => combobox.openDropdown()}
          error={
            typeof form.errors.authors === 'string'
              ? form.errors.authors
              : undefined
          }
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

Note: `form.errors.authors` uses `typeof` narrowing (not `as`) to satisfy CLAUDE.md's prohibition on `as` type assertions.

The `bookFormSchema` Zod schema validates `authors` as `z.array(z.object({ id: z.string(), name: z.string() })).min(1)`. The `__pending__:` prefix is a plain string so validation passes unchanged.


### Step 2 — Replace the author field in `BookCreateForm.tsx`

File: `src/features/books/BookCreateForm.tsx`

Apply the exact same Combobox replacement as Step 1. The only difference is that `BookCreateForm` also contains ISBN lookup logic — leave that unchanged. The `useState` for `authorSearch` is in addition to any existing state (there is none in this component currently).

Merge the new Mantine imports (`CheckIcon, Combobox, Group, Pill, PillsInput, useCombobox`) with the existing import from `@mantine/core`. Note that `Group` is already imported in `BookCreateForm.tsx` — do not duplicate it. Remove `MultiSelect` from the import.

Add `useState` to the React import (currently `import React from 'react'`).

The handler functions and JSX are identical to Step 1.


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

Inside `BookDetailEdit`, after the `updateBookMutation` hook call, add:

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

The test file (`src/features/books/BookForm.test.tsx`) currently tests `BookUpdateForm` and mocks `useAuthors`. Since `BookUpdateForm.tsx` does not import `useCreateAuthor` (pending author resolution happens in `BookDetailEdit.tsx`), no additional mock is needed.

After Step 1, the author field in `BookUpdateForm` changes from `MultiSelect` to a `PillsInput`-based Combobox. The existing tests do not query the author field directly (they query by "書名", "ISBN", checkboxes, and the submit button). Verify all existing tests still pass. If any test breaks due to the `MultiSelect` → `PillsInput` change, update the query to use `findByRole` or `findByLabelText` consistent with the new component.

The test for `combobox` (portals) in Mantine may require `userEvent` interactions; refer to `CLAUDE.md` for Mantine testing docs links if needed.


### Step 7 — Run checks and commit

From the repository root, run:

    npm run test
    npm run typecheck
    npm run lint

Fix any errors. Then commit:

    git add src/features/books/BookUpdateForm.tsx \
            src/features/books/BookCreateForm.tsx \
            src/features/books/resolvePendingAuthors.ts \
            src/features/books/BookDetailEdit.tsx \
            src/features/books/BookAddButton.tsx \
            src/features/books/BookForm.test.tsx
    git commit -m "Add author creation from book form"


## Concrete Steps

All commands run from `/home/hiterm/ghq/github.com/hiterm/bookshelf`.

Branch already exists: `feature/add-author-from-book-form` (rebased onto main).

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

New Mantine imports used in both form components:

    CheckIcon, Combobox, Group, Pill, PillsInput, useCombobox  — from '@mantine/core'
    useState  — from 'react'

Note: `Group` is already imported in `BookCreateForm.tsx`; do not duplicate it.

`MultiSelect` is removed from both form component imports after this change.
