## ADDED Requirements

### Requirement: Book revisions display purchase dates
The frontend SHALL query and display the nullable purchase date captured by each
book revision and operation-history snapshot.

#### Scenario: View a dated revision
- **WHEN** a historical revision contains a purchase date
- **THEN** the revision view displays that calendar date

#### Scenario: View a revision without a purchase date
- **WHEN** a historical revision has no purchase date
- **THEN** the existing optional-value placeholder is displayed
