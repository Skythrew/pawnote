# [Pornote (formerly `pronote-evolution`)](https://pornote.vercel.app)

> Project still in development.

Remake of Pronote using real data from their functions.
It provides a better UI - *currently this is not true because the UI isn't finished* -,
local saves to access even offline - *this works* - and notifications - *currently not finished*.

## Features

- [x] Multi-accounts (using **slugs**)
- [x] Local save of informations fetched (with **localForage**)
- [ ] Updating informations after timeout.

## ENT Available

### OpenENT
  - [x] `mon.lyceeconnecte.fr`

### Missing ?

If your ENT is missing, please feel free to do a pull request or open
an Issue to see if it can be added.

ENT files and configurations are [here](./utils/api/cas).

## TO-DO

- [ ] Save connected sessions
  - [x] Use a `Session` class.
  - [x] Make an export function.
  - [ ] Store the exported data into the localForage and then get data from it at every refresh.
- [ ] Multi-theme support
  - Create a 'theme' object key in localForage->pornote->(slug).
    This object will contains HEX color values for each objects.
    On load we add 'style' props to modified colors.
    If the color isn't modified => keep default (from Tailwind) 

## Warning

This project is made for educational purposes.
That means that the project will not really be
maintained. You can still use this app, to do
everyday tasks, but when it comes to start a quiz,
or record yourself, or whatever that isn't in the
`Features` part, you should use the **real** Pronote
application. Note that **Index-Education** can take down
this project at anytime.
