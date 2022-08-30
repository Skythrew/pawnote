# Error Codes

These are number codes, provided by the Pornote API (or the client for `-1`) that tells you what caused the error. 

The `code` property is always from type `number` and is always provided when the response contains `{ success: false }`.

| Code | Meaning                                                                    |
| ---- | -------------------------------------------------------------------------- |
| `-1` | No response from the request, so the client threw an error for the server. |