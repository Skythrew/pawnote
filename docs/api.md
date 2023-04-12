## `POST /login/ent_cookies`

Used when you need to login using ENT. Gather the cookies of the ENT by logging in and send them back to you for usage with the `/login/ent_ticket` endpoint.

### Request Body

Here, the encryption process for `credentials` property was *inspired by Pronote developers*.

To get the value of this property, you'll need to encode in Base64 the username and the password and then join the two with a `:` like this: `usernameInB64:passwordInB64`. When you have this, you'll need to encode this string in HEX then uppercase it and reverse the string.

The JS implementation using `node-forge` is looking like this:
```typescript
const credentials = forge.util.createBuffer(`${forge.util.encode64(username)}:${forge.util.encode64(password)}`)
  .toHex().toUpperCase().split("").reverse().join("");
```

Now that you have the credentials value, you can use it in the body request!

```typescript
type Request = {
  ent_url: string;
  credentials: string;
};
```

### Successful Response

```typescript
type Response = {
  ent_cookies: string[];
};
```

## `POST /login/ent_ticket`

This is used to get the Pronote URL ticket that allows you to login to a Pronote account using ENT cookies - that you can get from the `/login/ent_cookies` endpoint.

The `pronote_url` that is given in the response needs to be used as raw in `/login/informations` endpoint.

### Request Body

```typescript
type Request = {
  ent_url: string;
  ent_cookies: string[];
};
```

### Successful Response

```typescript
type Response = {
  /** URL with "identifiant" search params. */
  pronote_url: string;
};
```

## `POST /login/informations`

This endpoint can create new sessions.
It responds with the first `session` object.

### Request Body

```typescript
type Request = {  
  account_type: PronoteApiAccountId;
  pronote_url: string;

  /**
   * Tells the server to not clean the Pronote URL.
   * Defaults to `false`.
   */
  raw_url?: boolean;

  /**
   * Cookies used when downloading the Pronote page.
   * Required when creating a new session from ENT or an already set-up session.
   *
   * When correct, this will append `e` and `f` in to the `setup` object.
   */
  cookies?: string[];
};
```

### Successful Response

You can find more informations about the `PronoteApiLoginInformations` typing @ `/src/types/pronote.ts`.

```typescript
type Response = {
  received: PronoteApiLoginInformations["response"];
  session: SessionExported;
  cookies: string[];

  /** Available when using ENT or session recovery cookies. */
  setup?: {
    username: string;
    password: string;
  }
};
```

## `POST /login/identify`

### Request Body

```typescript
type Request = {
  /**
   * When the `/instance endpoint gave you an username, use it here
   * instead of your real Pronote account username.
   */
  pronote_username: string;

  session: SessionExported;
  cookies?: string[];
};
```

### Successful Response

You can find more informations about the `PronoteApiLoginIdentify` typing @ `/src/types/pronote.ts`.

```typescript
type Response = {
  received: PronoteApiLoginIdentify;
  session: SessionExported;
};
```

## `POST /login/authenticate`

To get the `solved_challenge` property, you'll need to do some tricks that are fully explained in [this documentation written by the authors of `pronotepy`](https://github.com/bain3/pronotepy/blob/master/PRONOTE%20protocol.md).

### Request Body

```typescript
type Request = {
  /** Challenge from `ApiLoginIdentify["response"]` solved. */
  solved_challenge: string;

  session: SessionExported;
  cookies?: string[];
};
```

### Successful Response

```typescript
type Response = {
  received: PronoteApiLoginAuthenticate["response"];
  session: SessionExported;
};
```

