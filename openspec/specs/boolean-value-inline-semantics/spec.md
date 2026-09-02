# boolean-value-inline-semantics Specification

## Purpose

Define `BooleanValue` as an inline-safe presentational component that remains
valid in prose, table cells, and detail views.

## Requirements

### Requirement: BooleanValue is inline-safe
The `BooleanValue` component SHALL render its `ThemeIcon` with an inline
`span` root for both boolean values so it can be used in prose, table cells,
and detail views without invalid block-level nesting.

#### Scenario: True value inside paragraph content
- **WHEN** `BooleanValue` receives `true` and is rendered inside a `p` element
- **THEN** its `ThemeIcon` root is a `span` and no nested `div` is introduced

#### Scenario: False value inside paragraph content
- **WHEN** `BooleanValue` receives `false` and is rendered inside a `p` element
- **THEN** its `ThemeIcon` root is a `span` and no nested `div` is introduced

### Requirement: BooleanValue presentation remains unchanged
The `BooleanValue` component SHALL preserve its existing icon, color, size,
and boolean meaning when its root element changes.

#### Scenario: Existing consumers render boolean values
- **WHEN** an existing prose, table-cell, or detail-view consumer renders a
  `BooleanValue`
- **THEN** it receives the same visual and semantic boolean indication without
  requiring caller-side layout changes
