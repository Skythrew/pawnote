# API - Pornote

> API used by Pornote to gather informations from Pronote.

- This API is also used for the Pornote Discord bot that is currently under paused development.
- Pornote API base endpoint is located at `https://pornote.vercel.app/api`.

## Responses Helpers

### Success

When a request was successfully executed, it responses with `ResponseSuccess<T>` where
`T` is the typing of the `data` property. 

```typescript
interface ResponseSuccess<T> {
  success: true;
  data: T;
}
```

### Error

When a request failed to execute, it always - except on currently unhandled errors - responses with `ResponseError`.

```typescript
interface ResponseError {
  success: false;
  message: string;
  debug?: unknown;
}
```

The `message` property is a `string` explaining why the request failed.

The `debug` property is optional so not always present in the response.
When there's a `debug` property, most of the time, it's a simple object with data that
have been processed server-side.

## `POST /geolocation`

A small request to proxy the `https://www.index-education.com/swie/geoloc.php` endpoint gived by Index-Education.
It takes a longitude and a latitude as body parameters and returns you a parsed and more verboose version of the given endpoint. 

### Request Body

```typescript
type Request = {
  latitude: number;
  longitude: number;
};
```

### Successful Response

```typescript
type Response = {
    url: string;
    name: string;
    latitude: number;
    longitude: number;
    postal_code: number;
    /** Distance from the given location in meters. */
    distance: number;
}[]; // Note that it's an array of objects.
```

## `POST /instance`

Gives you some informations about the given Pronote instance such as available account types, instance's name and more...
Since the data of this endpoint can vary a lot, not every parameters are typed.
If you found not typed parameters or anything else, feel free to contribute !

### Request Body

```typescript
type Request = {
  pronote_url: string;
};
```

### Successful Response

You can find more informations about the `PronoteApiInstance` typing @ `/src/types/pronote.ts`.

```typescript
type Response = {
  received: PronoteApiInstance;

  /** Base URL of the instance. */
  pronote_url: string;
  /** When available, URL redirecting to the ENT login. */
  ent_url?: string;
};
```

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

### Response Body

```typescript
type Response = {
  ent_cookies: string[];
};
```

## `POST /login/informations`

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

  /** Available when using ENT or session recovery cookies. */
  setup?: {
    username: string;
    password: string;
  }
};
```

## `POST /login/identify`

Starts a new login process on the Pronote side. This is the *second* step to login into your Pronote account if you don't use ENT or old session recovery.

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
};
```

