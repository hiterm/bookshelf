# Routing

This application uses TanStack Router with file-based routing.

## Route files

Keep route files focused on route definitions.

Do not export runtime values used by route properties such as `component` from
the same route file. Doing so can prevent TanStack Router from automatically
code-splitting them and can increase the bundle size.

If a route component needs to be imported by tests or other modules, move it to
a non-route file instead. Colocated files prefixed with `-` are ignored by
TanStack Router's file-based route generation by default.

## Reference

- [Automatic Code Splitting](https://tanstack.com/router/latest/docs/guide/automatic-code-splitting)
