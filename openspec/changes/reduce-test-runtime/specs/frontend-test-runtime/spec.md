## ADDED Requirements

### Requirement: Runtime optimizations preserve regression detection

Frontend test runtime optimizations SHALL preserve existing behavioral assertions, completed asynchronous regression checks, test isolation, and distinct unit, mock-API, demo, and real-backend boundaries. Performance claims SHALL compare passing baseline and candidate runs under the same measurement conditions.

#### Scenario: Reuse test setup work

- **WHEN** repeated test setup work is reused within a test fixture
- **THEN** every existing scenario and assertion remains, each test retains isolation, and a paired full-suite measurement records elapsed time and passing test identity

#### Scenario: Evaluate an optimization

- **WHEN** a runtime optimization is proposed
- **THEN** its measurement conditions, individual results, limitations, and adoption or rejection rationale are recorded

### Requirement: Mock API schemas preserve per-test state isolation

Mock-API browser fixtures SHALL bind executable GraphQL schemas to the current test's MockStore. A schema MAY be reused across requests within that page fixture, but SHALL NOT share mutable store state across tests. Resolvers SHALL observe mutations performed by earlier requests in the same test.

#### Scenario: Read after mutation

- **WHEN** a browser test mutates an entity and then requests its details or list through the same fixture
- **THEN** the reused schema resolves against the updated store and returns the new state

#### Scenario: Another test starts

- **WHEN** another browser test initializes its page fixture
- **THEN** its schema binds a fresh per-test MockStore rather than the previous test's data
