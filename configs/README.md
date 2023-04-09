## Pawnote - Configurations

Mostly configuration files and setups.

## ESLint

Install a configuration using...

```bash
pnpm add -D eslint @pawnote/eslint-config
```

Don't forget to replace `eslint-config` by the name of the config you want to use.

Now, create a `.eslintrc.json` file and appends the following...

```json
{
  "root": true,
  "extends": [
    "@pawnote/eslint-config"
  ]
}
```

And you're done !
