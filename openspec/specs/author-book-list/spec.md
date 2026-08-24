# author-book-list Specification

## Purpose
TBD - created by archiving change show-author-books. Update Purpose after archive.
## Requirements
### Requirement: Display an author's related books
The system SHALL display books returned by `Author.books` on the corresponding
author detail page in API order.

#### Scenario: Author has related books
- **WHEN** a user opens an author detail page whose `books` field is non-empty
- **THEN** the system displays each returned book with its title, ISBN, format, read state, and owned state

#### Scenario: Book has multiple authors
- **WHEN** a book is returned by `Author.books` for an author
- **THEN** the system displays the book regardless of whether the book has additional authors

### Requirement: Navigate to a related book
The system SHALL make each related book title a link to that book's detail
page.

#### Scenario: Open a related book
- **WHEN** a user activates a book title in the author's book list
- **THEN** the system navigates to that book's detail page

### Requirement: Display an empty author book list
The system SHALL communicate when an author has no related books.

#### Scenario: Author has no books
- **WHEN** a user opens an author detail page whose `books` field is empty
- **THEN** the system displays `この著者の本はありません`

