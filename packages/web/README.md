<h1 align="center"><a href="https://www.pornote.ml">Pornote - Web</a></h1>

<p align="center">
  <kbd>SolidJS</kbd> - <kbd>WindiCSS</kbd> - <kbd>TypeScript</kbd> - <kbd>Vercel</kbd>
</p>

<hr />

## Contribute

### Set-up

- Install [`pnpm`](https://pnpm.io) if not already installed.
  ```bash
  npm install --global pnpm
  ```
- Clone the repository and `cd` into it.
  ```bash
  git clone https://github.com/Vexcited/pornote
  cd pornote
  ```
- Install dependencies.
  ```bash
  pnpm install
  ```

### Internal dependencies

For the app to be functionnal, you'll have to build all its internal dependencies.

```bash
# Build the API package
pnpm --filter @pornote/api run build

# Build the i18n package
pnpm --filter @pornote/i18n run build

# Build the client package
pnpm --filter @pornote/client run build

# Build the UI package
pnpm --filter @pornote/ui run build
```

### Development

Before, **make sure you've built the [internal dependencies](#internal-dependencies).**
If you did that, then you can directly run this command.

```bash
pnpm --filter @pornote/web run dev # Add `--host` to listen on `0.0.0.0`
```

### Production

You can easily build the app for production using this simple command. **Don't forget to build the [internal dependencies](#internal-dependencies) before.**

```bash
pnpm --filter @pornote/web run build
```

You'll find the Vercel output in `.vercel/output`.
