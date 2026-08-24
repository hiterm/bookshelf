## Requirements

### Requirement: Descriptive frontend component names
The frontend codebase SHALL use the approved descriptive names for the ten
scoped components, without changing their runtime behavior.

#### Scenario: Existing component behavior is exercised
- **WHEN** the existing frontend test suite runs after the rename
- **THEN** the components retain their prior behavior under their new names
