# Pawnote - Internal packages

Inside Pawnote, we use internal packages that is re-used across platforms, so we don't have to write stuff everytime twice.

1. [`api`](./api/): Contains code to call Pronote's API. Here, we export functions that works on every platforms.
2. [`i18n`](./i18n/): Contains locales for Pawnote. Everyone can help in the translations, just make a Pull Request !
3. [`client`](./client/): Contains core functions, like stores, API parsing and every client-side related functions.

We listed those packages in the order they have to be built.

It should be `api` first, since it contains no internal dependency. \
Then, `i18n` should come second since it uses `api` package internally. \
Finally, `client` should be the last to build since it relies on `api` package.
