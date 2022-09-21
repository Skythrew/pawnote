# API - Pornote

> API used by Pornote to gather informations from Pronote.

## Responses

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
