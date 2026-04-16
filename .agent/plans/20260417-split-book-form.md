# Split BookForm into separate Create and Update forms

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds. This document must be maintained in accordance with `.agent/PLANS.md`.

## Purpose / Big Picture

Currently, the book creation form and the book update form share a single hook `useBookForm` (in `src/features/books/BookForm.tsx`). The hook accepts a boolean flag `enableIsbnLookup` to conditionally show ISBN auto-fill functionality, which is only needed at creation time. As the two forms continue to diverge, adding more flags to a shared hook will make the code harder to read and maintain.

After this change, the creation and update forms will be separate React components with clear, distinct responsibilities. Shared field markup will live in a small helper component. The behavior visible to the user remains identical: the book creation dialog still has the ISBN auto-fill button; the book detail edit page does not.

## Progress

- [ ] Create `src/features/books/BookFormFields.tsx` — shared fields component
- [ ] Create `src/features/books/BookCreateForm.tsx` — creation-specific form component
- [ ] Create `src/features/books/BookUpdateForm.tsx` — update-specific form component
- [ ] Update `src/features/books/BookAddButton.tsx` to use `BookCreateForm`
- [ ] Update `src/features/books/BookDetailEdit.tsx` to use `BookUpdateForm`
- [ ] Update `src/features/books/BookForm.test.tsx` to test the new components
- [ ] Delete `src/features/books/BookForm.tsx` (the old shared hook file)
- [ ] Run pre-commit checklist and verify all checks pass

## Surprises & Discoveries

(none yet)

## Decision Log

- Decision: Extract shared fields into `BookFormFields` component rather than duplicating markup in both forms.
  Rationale: The fields (title, authors, format, store, priority, ISBN, read, owned) are identical in both forms. Duplication would make future field additions or label changes require two edits. A shared component avoids that without any conditional flag.
  Date/Author: 2026-04-17 / hiterm

- Decision: `BookFormFields` accepts a Mantine `UseFormReturnType` object as a prop instead of individual field props.
  Rationale: Mantine's `useForm` returns a typed form object. Passing it directly is the idiomatic pattern in this codebase (the existing `BookForm.tsx` does exactly this). It avoids creating a large prop interface for every field.
  Date/Author: 2026-04-17 / hiterm

- Decision: Replace the render-hook pattern (`useBookForm` returning `{ form: ReactElement, submitForm }`) with plain React function components.
  Rationale: Returning JSX from a hook is an unconventional pattern that prevents callers from customising form layout without touching the hook. Separate components (`BookCreateForm`, `BookUpdateForm`) are more composable and align with React conventions. `BookAddButton` and `BookDetailEdit` each own their submit button and layout, so they can pass `onSubmit` as a prop.
  Date/Author: 2026-04-17 / hiterm

- Decision: `BookFormValues` type and `bookFormSchema` are moved into `BookFormFields.tsx` since they describe the shared shape of both forms.
  Rationale: They no longer belong to a single form variant. Placing them in the shared file is the most natural home.
  Date/Author: 2026-04-17 / hiterm

## Outcomes & Retrospective

(not yet written)

## Context and Orientation

The relevant files are all under `src/features/books/`:

`BookForm.tsx` — the current shared hook. Exports `useBookForm` (a hook that returns `{ form: ReactElement, submitForm }`), `BookFormValues` (the TypeScript type for form data), and the internal Zod schema. The hook accepts `onSubmit`, `initialValues`, and an optional `enableIsbnLookup` flag. When `enableIsbnLookup` is true, the ISBN field is rendered with a magnifying-glass button that calls the NDL API to auto-fill the title and authors.

`BookAddButton.tsx` — the book creation entry point. Renders a modal dialog. Uses `useBookForm` with `enableIsbnLookup: true` and calls `useCreateBook` on submit.

`BookDetailEdit.tsx` — the book update page. Uses `useBookForm` without `enableIsbnLookup` and calls `useUpdateBook` on submit.

`BookForm.test.tsx` — Vitest tests for `useBookForm`. Mocks `useAuthors`. Uses a small `TestForm` wrapper component to render the hook output inside a real `<form>` element.

`useIsbnLookup.ts` — hook that manages ISBN lookup state and performs the NDL API call. Used only inside `BookForm.tsx` today; after the split it will be used only inside `BookCreateForm.tsx`.

Key types: `BookFormValues` is the shape of form data (title, authors, isbn, read, owned, priority, format, store). `Author` is `{ id: string; name: string }`. These come from `src/features/books/entity/Author.ts` and the GraphQL-generated types.

The project uses Mantine's `useForm` with `zodResolver` for validation, React Query for server state, and Vitest + Testing Library for tests.

## Plan of Work

### Step 1 — Create `BookFormFields.tsx`

Create a new file `src/features/books/BookFormFields.tsx`. This file:

1. Defines and exports `BookFormValues` (moved from `BookForm.tsx`).
2. Defines and exports `bookFormSchema` (moved from `BookForm.tsx`).
3. Exports a `BookFormFields` React component.

`BookFormFields` takes two props:

    form: UseFormReturnType<BookFormValues>
    extraFields?: React.ReactNode

The `UseFormReturnType` type is imported from `@mantine/form`. The `form` prop is a live Mantine form object; the component uses `form.getInputProps` and `form.values` to wire up each field, exactly as the current `BookForm.tsx` does. The `extraFields` prop is rendered at the end of the `<Stack>` so that `BookCreateForm` can inject the ISBN auto-fill group without `BookFormFields` knowing about it.

The rendered fields, in order: 書名 (title), 著者 (authors MultiSelect), 形式 (format Select), ストア (store Select), 優先度 (priority NumberInput), ISBN (plain TextInput — no button), 既読 (read Checkbox), 所有 (owned Checkbox).

The `useAuthors` hook is called inside `BookFormFields` (it was called inside `useBookForm` before). If authors are loading or errored, `BookFormFields` renders a `<Loader />` or error message accordingly, mirroring the existing behaviour.

### Step 2 — Create `BookCreateForm.tsx`

Create `src/features/books/BookCreateForm.tsx`. This file exports a `BookCreateForm` component with the following props:

    onSubmit: (values: BookFormValues) => Promise<void>
    initialValues: BookFormValues
    isPending: boolean

Internally it calls `useForm` (from `@mantine/form`) with `zodResolver(bookFormSchema)` and `validateInputOnBlur: true`, exactly as `useBookForm` does today. It also calls `useIsbnLookup` and renders the ISBN auto-fill group (the `<Group>` with `<TextInput label="ISBN">` and the `<ActionIcon>` with `<IconSearch>`). This ISBN group is passed to `BookFormFields` via the `extraFields` prop so it appears in the correct position (after the priority field).

The component renders:

    <BookFormFields form={form} extraFields={isbnFieldGroup} />
    <Button type="submit" ...>追加</Button>

The `<form onSubmit={...}>` wrapper and submit button are the caller's responsibility (they live in `BookAddButton`), so `BookCreateForm` does not render a `<form>` element itself. Instead it returns only the fields and the submit button. Wait — looking at `BookAddButton`, the `<form>` and submit `<Button>` are already in `BookAddButton`. So `BookCreateForm` should expose `submitForm` so `BookAddButton` can attach it to the `<form onSubmit>`. The simplest approach: `BookCreateForm` is a component that renders `<BookFormFields ... />` and the ISBN group, and it accepts a ref or callback. Actually the cleanest approach is to keep the pattern simple: `BookCreateForm` renders the fields only (no `<form>` tag), and `BookAddButton` wraps them in its own `<form onSubmit={handleSubmit}>`. To make this work, `BookCreateForm` calls `useImperativeHandle` or simply exposes `form.onSubmit` via a render prop. The simplest approach without over-engineering: make `BookAddButton` own the form submit handler and pass it directly. `BookCreateForm` is a controlled component that receives `form` as a prop.

Revised approach (simpler): `BookAddButton` creates the `useForm` instance itself and passes it to `BookCreateForm`. `BookCreateForm` only renders the fields plus the ISBN auto-fill group. This way `BookAddButton` controls submit via `form.onSubmit(submitBook)` directly.

    // BookAddButton.tsx
    const form = useForm({ initialValues: emptyBook, validate: zodResolver(bookFormSchema), validateInputOnBlur: true });
    ...
    <form onSubmit={form.onSubmit(submitBook)}>
      <BookCreateForm form={form} />
      <Button type="submit" ...>追加</Button>
    </form>

    // BookCreateForm.tsx — props
    type BookCreateFormProps = { form: UseFormReturnType<BookFormValues> }

`BookCreateForm` renders: the ISBN auto-fill group (TextInput + ActionIcon), plus `<BookFormFields form={form} extraFields={isbnGroup} />`.

### Step 3 — Create `BookUpdateForm.tsx`

Create `src/features/books/BookUpdateForm.tsx` with the same simple shape:

    type BookUpdateFormProps = { form: UseFormReturnType<BookFormValues> }

It renders `<BookFormFields form={form} />` (no extra fields). `BookDetailEdit` creates the `useForm` instance and the submit button, just as `BookAddButton` does.

### Step 4 — Update `BookAddButton.tsx`

Remove the `useBookForm` import and call. Add imports for `useForm` (from `@mantine/form`), `zodResolver` (from `mantine-form-zod-resolver`), `bookFormSchema` and `BookFormValues` (from `./BookFormFields`), and `BookCreateForm` (from `./BookCreateForm`). Move the `useForm` call and `form.onSubmit` wiring here. The modal body becomes:

    <form onSubmit={form.onSubmit((values, event) => void submitBook(values))}>
      <BookCreateForm form={form} />
      <Button type="submit" mt="md" disabled={...} loading={...}>追加</Button>
    </form>

### Step 5 — Update `BookDetailEdit.tsx`

Remove the `useBookForm` import and call. Add imports for `useForm`, `zodResolver`, `bookFormSchema`, `BookFormValues`, and `BookUpdateForm`. Move the `useForm` call here. The rendered body becomes:

    <Box component="form" onSubmit={form.onSubmit((values, event) => void handleSubmit(values))} style={{ minWidth: 400 }}>
      <BookUpdateForm form={form} />
      <Group mt="md">
        <Button type="submit">Save</Button>
        <LinkButton ...>Cancel</LinkButton>
      </Group>
    </Box>

Note: `initialValues` for the update form is `book` (the `Book` entity from props), which is compatible with `BookFormValues`.

### Step 6 — Update `BookForm.test.tsx`

The existing tests exercise `useBookForm`. After the split, replace `useBookForm` usage with a `TestForm` component that creates a `useForm` instance and renders `BookFormFields`. The test behaviour (submit, field rendering, checkbox, empty ISBN) remains identical; only the wrapper changes.

Replace:

    import { BookFormValues, useBookForm } from "./BookForm";
    ...
    const TestForm = ({ onSubmit }) => {
      const { form, submitForm } = useBookForm({ initialValues: emptyBook, onSubmit });
      return <form onSubmit={submitForm}>{form}<button type="submit">送信</button></form>;
    };

With:

    import { BookFormValues, bookFormSchema, BookFormFields } from "./BookFormFields";
    import { useForm } from "@mantine/form";
    import { zodResolver } from "mantine-form-zod-resolver";
    ...
    const TestForm = ({ onSubmit }) => {
      const form = useForm({ initialValues: emptyBook, validate: zodResolver(bookFormSchema), validateInputOnBlur: true });
      return (
        <form onSubmit={form.onSubmit(onSubmit)}>
          <BookFormFields form={form} />
          <button type="submit">送信</button>
        </form>
      );
    };

The mock for `useAuthors` stays unchanged.

### Step 7 — Delete `BookForm.tsx`

Once all imports to `BookForm.tsx` are gone (verified by grep), delete the file.

### Step 8 — Pre-commit checklist

Run the following from the repository root and confirm all pass:

    npm run generate
    npm run test
    npm run typecheck
    npm run lint

## Concrete Steps

All commands are run from the repository root (`/home/hiterm/ghq/github.com/hiterm/bookshelf`).

1. Create `.agent/plans/20260417-split-book-form.md` (this file). Done.

2. Create `src/features/books/BookFormFields.tsx` with `BookFormValues`, `bookFormSchema`, and the `BookFormFields` component.

3. Create `src/features/books/BookCreateForm.tsx` with `BookCreateForm`.

4. Create `src/features/books/BookUpdateForm.tsx` with `BookUpdateForm`.

5. Edit `src/features/books/BookAddButton.tsx` to use `BookCreateForm`.

6. Edit `src/features/books/BookDetailEdit.tsx` to use `BookUpdateForm`.

7. Edit `src/features/books/BookForm.test.tsx` to use `BookFormFields`.

8. Verify no remaining imports from `BookForm.tsx`:

        grep -r "BookForm" src/ --include="*.tsx" --include="*.ts"

   Expected: only `BookForm.test.tsx` itself, if it still exists under a new name, and no references to `./BookForm` from other files.

9. Delete `src/features/books/BookForm.tsx`.

10. Run checks:

        npm run generate
        npm run test
        npm run typecheck
        npm run lint

    Expected: all exit with code 0 and no errors.

11. Commit with a meaningful message, e.g.:

        Split BookForm into BookCreateForm and BookUpdateForm

## Validation and Acceptance

After completing all steps:

- `npm run test` exits 0. The tests in `BookForm.test.tsx` (or its renamed equivalent) all pass, including "submits with entered title", "renders all form fields", "submits with read checkbox checked", and "submits with empty ISBN".
- `npm run typecheck` exits 0 with no type errors.
- `npm run lint` exits 0 with no lint errors.
- Manually open the app (`npm run dev`), navigate to the book list, click 追加. The modal opens; the ISBN field has the magnifying-glass button. Enter a title, click 追加, and the book is created.
- Navigate to a book's detail page and click edit. The form opens without an ISBN auto-fill button. Modify the title, click Save, and the book is updated.

## Idempotence and Recovery

All steps are additive until step 9 (deletion of `BookForm.tsx`). If something goes wrong before step 9, the old file is still present and the app still works. The new files can be deleted and recreated safely. After step 9, recovery is via `git checkout src/features/books/BookForm.tsx`.

## Artifacts and Notes

Current `BookForm.tsx` exports at a glance:

    export type BookFormValues = { title, authors, isbn, read, owned, priority, format, store }
    export const useBookForm = (props: BookFormProps): BookFormReturn => { ... }

`BookFormReturn` is `{ form: ReactElement; submitForm: React.EventHandler<React.SyntheticEvent<HTMLFormElement>> }`.

After the split the public surface is:

    BookFormFields.tsx  exports: BookFormValues, bookFormSchema, BookFormFields
    BookCreateForm.tsx  exports: BookCreateForm
    BookUpdateForm.tsx  exports: BookUpdateForm

## Interfaces and Dependencies

In `src/features/books/BookFormFields.tsx`, define:

    export type BookFormValues = {
      title: string;
      authors: Author[];
      isbn: string;
      read: boolean;
      owned: boolean;
      priority: number;
      format: BookFormat;
      store: BookStore;
    };

    export const bookFormSchema = z.object({ ... }); // same as current bookFormSchema in BookForm.tsx

    type BookFormFieldsProps = {
      form: UseFormReturnType<BookFormValues>;
      extraFields?: React.ReactNode;
    };

    export const BookFormFields: React.FC<BookFormFieldsProps> = ({ form, extraFields }) => { ... };

In `src/features/books/BookCreateForm.tsx`:

    type BookCreateFormProps = { form: UseFormReturnType<BookFormValues> };
    export const BookCreateForm: React.FC<BookCreateFormProps> = ({ form }) => { ... };

In `src/features/books/BookUpdateForm.tsx`:

    type BookUpdateFormProps = { form: UseFormReturnType<BookFormValues> };
    export const BookUpdateForm: React.FC<BookUpdateFormProps> = ({ form }) => { ... };
