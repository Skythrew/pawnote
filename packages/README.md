# Pornote - How the app is structured ?

I use pnpm workspaces to structure the whole code of Pornote.

Inside Pornote (Web/Mobile), I use internal packages that will be re-used across apps, so I don't have to write it twice everytime.

## Packages

- [`pornote`](./pornote/): Contains code for the web app that is written using [SolidStart](https://start.solidjs.com) and deployed with [Vercel](https://vercel.com).
- [`mobile`](./mobile/): Contains code for the mobile app that is written using [Ionic Capacitor](https://capacitorjs.com/).
- [`ui`](./ui/): Contains components and each pages used in Pornote. This is where the UI is built to be re-used across `mobile` and `pornote`.
- [`api`](./api/): Contains code to call Pronote's API. Here, we export functions that will be re-used across `mobile` and `pornote`. I don't reuse the web API that I expose in `mobile` to prevent server usage.
