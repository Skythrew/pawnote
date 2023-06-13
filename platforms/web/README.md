<h1 align="center"><a href="https://pawnote.vercel.app">Pawnote - Web</a></h1>

<p align="center">
  <kbd>SolidJS</kbd> - <kbd>UnoCSS</kbd> - <kbd>TypeScript</kbd> - <kbd>Vercel</kbd>
</p>

<hr />

## Contribute

### Set-up

Before working on the web app you'll have to build the [internal dependencies](../../packages/).

```bash
# Build the API package
pnpm --filter @pawnote/api run build

# Build the i18n package
pnpm --filter @pawnote/i18n run build

# Build the client package
pnpm --filter @pawnote/client run build
```

### Development

Before, **make sure you've built the [internal dependencies](#Set-up).** \
If you did that, then you can directly run this command.

```bash
pnpm --filter @pawnote/web run dev # Add `--host` to listen on `0.0.0.0`
```

### Production

You can easily build the app for production using this simple command. \
**Don't forget to build the [internal dependencies](#Set-up) before.**

```bash
pnpm --filter @pawnote/web run build
```

You'll find the output for Vercel in `.vercel/output`.
