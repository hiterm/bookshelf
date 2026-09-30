# edit-submission-lifecycle Specification

## Purpose

TBD - created by archiving change edit-submission-lifecycle. Update Purpose after archive.

## Requirements

### Requirement: A book edit has one active submission

The frontend SHALL disable the Save button and show its loading state during
pending author resolution, book update, and save navigation. While the button
is disabled, further user actions on it SHALL NOT start another book edit.

#### Scenario: Pending author resolution

- **WHEN** a book edit is submitted with a pending author and author creation has not settled
- **THEN** Save is disabled and loading, and another user action on Save does not create another author or update the book

#### Scenario: Pending book update

- **WHEN** author resolution completes and the book update has not settled
- **THEN** Save remains disabled and loading, and another user action on Save does not create another author or update the book again

### Requirement: An author edit has one active submission

The frontend SHALL disable the Save button and show its loading state while
the author update or save navigation is in progress. While the button is
disabled, further user actions on it SHALL NOT start another author update.

#### Scenario: Pending author update

- **WHEN** an author edit update has not settled
- **THEN** Save is disabled and loading, and another user action on Save does not start another update

### Requirement: Failed edits can be retried

The frontend SHALL release the submission lock after a failed author creation or edit update, preserve editable form values, and allow another Save attempt.

#### Scenario: Book author creation fails

- **WHEN** creating a pending author fails during a book edit
- **THEN** the book is not updated, the entered values remain, and Save can be retried

#### Scenario: Book update fails after author resolution

- **WHEN** a book update fails after pending authors are resolved
- **THEN** the resolved author IDs and other entered values remain, and retry updates the book without creating those authors again

#### Scenario: Author update fails

- **WHEN** an author edit update fails
- **THEN** the entered values remain and Save can be retried

### Requirement: Book creation has one active submission

The frontend SHALL disable the Add button and show its loading state during
pending author resolution and book creation. While the button is disabled,
further user actions on it SHALL NOT start another creation.

#### Scenario: Pending author resolution for creation

- **WHEN** a book creation is submitted with a pending author and author creation has not settled
- **THEN** Add is disabled and loading, and another user action on Add does not create another author or create the book

#### Scenario: Pending book creation

- **WHEN** author resolution completes and book creation has not settled
- **THEN** Add remains disabled and loading, and another user action on Add does not create another author or create the book again

### Requirement: Failed book creation can be retried

The frontend SHALL re-enable Add after failed author or book creation and
preserve editable values for another attempt.

#### Scenario: Book creation fails after author resolution

- **WHEN** book creation fails after a pending author was resolved
- **THEN** the resolved author ID and other entered values remain, and a user can retry without creating that author again
