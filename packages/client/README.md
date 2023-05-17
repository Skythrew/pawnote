# Pawnote - Client

> Internal package responsible to handle most of the client tasks such
> as calling API, caching endpoints, stores, ...

## Scripts

- `pnpm build`: runs `eslint` and compiles into the `dist` directory.

## Usage in Pawnote

Before anything, make sure the base URL of the app is `/app/`.
This is a constant in this package when calling `navigate` from `@solidjs/router`.

### `UserProvider` and `useUser`

When enterring a session, each pages or components that needs the actual user
will have to be a children of `<UserProvider />`

To get the value of this provider, you can `const [user, { mutate }] = useUser()|`

<!-- ### `useEndpoint` -->

