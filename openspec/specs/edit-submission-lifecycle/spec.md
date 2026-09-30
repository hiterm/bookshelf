# edit-submission-lifecycle Specification

## Purpose

TBD - created by archiving change edit-submission-lifecycle. Update Purpose after archive.

## Requirements

### Requirement: A book edit has one active submission

The frontend SHALL prevent another book edit submission while pending author resolution, book update, or save navigation is in progress and SHALL display a disabled, loading Save button throughout that period.

#### Scenario: Pending author resolution

- **WHEN** a book edit is submitted with a pending author and author creation has not settled
- **THEN** further submit events do not create another author or update the book

#### Scenario: Pending book update

- **WHEN** author resolution completes and the book update has not settled
- **THEN** further submit events do not create another author or update the book again

### Requirement: An author edit has one active submission

The frontend SHALL prevent another author edit submission while its update or save navigation is in progress and SHALL display a disabled, loading Save button throughout that period.

#### Scenario: Pending author update

- **WHEN** an author edit update has not settled
- **THEN** further submit events do not start another update

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
