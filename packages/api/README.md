# Pawnote - API

> Internal package that provides functions to help calling Pronote's API.

## Scripts

- `pnpm build`: runs `tsc` and compiles into the `dist` directory.

## Usage in Pawnote

This is the first internal package to build before anything else. \
See the [`packages`' README](../README.md) to understand the process.

## Contributing

There's some rules that needs to be follow if you ever need to add an handler or something to that library.

### Handlers ([`./src/handlers/`](./src/handlers/))

For each handler, let's take `geolocation` as example, we have a folder, so here `./src/handlers/geolocation/`.

In this folder, we have two files,
  - `types.ts`: typings for that handler ;
  - `index.ts`: code for the handler

#### `types.ts`

We export two interfaces from there: a type for the Pronote's endpoint and a type for our endpoint. They include the name/path of the handler. We prefix it by `Pronote` to show that the type is for the Pronote's endpoint.

We also export a Zod schema to check body in each requests.

Example using `geolocation`:

```typescript
import { z } from "zod";

export const ApiGeolocationRequestSchema = z.object({
  // types...
});

export interface PronoteApiGeolocation {
  request: z.infer<typeof ApiGeolocationRequestSchema>
  // request: { /** types... */ } // only when we have huge typed stuff that we don't want to check using Zod.

  response: {
    // types...
  }
}

export interface ApiGeolocation {
  request: {
    // types
  }

  response: {
    // types
  }

  path: "/geolocation";
}
```

Notice how we also export the `path` in the type of our API endpoint.

#### `index.ts`

We follow a structure that looks like this for every handler... (using our `geolocation` example)

```typescript
import type { PronoteApiGeolocation, ApiGeolocation } from "./types";
import { ApiGeolocationRequestSchema } from "./types";

import { createApiFunction } from "@/utils/handlers/create";

/**
 * A description for the handler here.
 */
const geolocation = createApiFunction<ApiGeolocation>(ApiGeolocationRequestSchema, async (req, res) => {
  // Do stuff with the request body using `req.body`
  // We're gonna use the Pronote's API typings we did before to build our request body.
  const body: PronoteApiGeolocation["request"] = {
    // ...
  };

  // Send request using `req.fetch`.
  const response = await req.fetch(url, { method: "POST", body });

  // Get the response using built-in fetcher functions.
  // Also add the Pronote's API typings we did before for the response.
  const data = await response.json<PronoteApiGeolocation["response"]>();
  
  // You can change the data here to make it match our API typings.
  const results: ApiGeolocation["response"] = {
    // ...
  };

  // Return a success response with data.
  // We use this method so `results` is wrapped around `ResponseSuccess` type.
  return res.success(results);
});

export default geolocation;
```

#### Export the handler in the library

Jump into the `./src/handlers/index.ts` file to export your new handler with the following,

```typescript
// Since the handler is default exported, we have to rename it to match.
export { default as geolocation } from "./geolocation";
export * from "./geolocation/types";
```
