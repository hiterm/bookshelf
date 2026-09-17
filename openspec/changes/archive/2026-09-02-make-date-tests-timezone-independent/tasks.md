## 1. Test Investigation and Implementation

- [x] 1.1 Inspect the affected history tests and adjacent timestamp assertions
  for fixed UTC wall-clock expectations of locally formatted instants
- [x] 1.2 Add a narrow test-only local timestamp expectation helper
- [x] 1.3 Update BookHistory and OperationList assertions to use the helper

## 2. Verification

- [x] 2.1 Run the unit test suite with `TZ=UTC`
- [x] 2.2 Run the unit test suite with `TZ=Asia/Tokyo`
- [x] 2.3 Run generation, lint autofix, and TypeScript type checking
- [x] 2.4 Confirm the final diff does not change production timezone behavior or
  unrelated date handling
