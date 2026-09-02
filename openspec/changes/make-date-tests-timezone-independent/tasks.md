## 1. Test Investigation and Implementation

- [ ] 1.1 Inspect the affected history tests and adjacent timestamp assertions
  for fixed UTC wall-clock expectations of locally formatted instants
- [ ] 1.2 Add a narrow test-only local timestamp expectation helper
- [ ] 1.3 Update BookHistory and OperationList assertions to use the helper

## 2. Verification

- [ ] 2.1 Run the unit test suite with `TZ=UTC`
- [ ] 2.2 Run the unit test suite with `TZ=Asia/Tokyo`
- [ ] 2.3 Run generation, lint autofix, and TypeScript type checking
- [ ] 2.4 Confirm the final diff does not change production timezone behavior or
  unrelated date handling
