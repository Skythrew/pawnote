# API - Pornote

> API used by Pornote to gather informations from Pronote.

- This API is also used for the Discord bot.
- Endpoint is, of course, `https://pornote.vercel.app/api`.

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

```typescript
// TODO: Write this type.
type Request = unknown;
```

