<h1 align="center"><a href="https://pawnote.vercel.app">Pawnote</a></h1>

<p align="center">
  <kbd>SolidJS</kbd> - <kbd>WindiCSS</kbd> - <kbd>TypeScript</kbd> <br />
</p>

<hr />

Unofficial client for [Pronote](https://www.index-education.com/fr/logiciel-gestion-vie-scolaire.php)
including many features such as...

- [x] Offline access.
- [x] Multi-accounts stored locally.
- [x] Local save of data for each account.
- [x] Speed and performance under the hood thanks to [SolidJS](https://solidjs.com)' reactivity.
- [x] ENT support without any struggle.
  <details>
   <summary><b>Supported ENTs</b></summary>
   <details>
     <summary><b>OpenENT (w/Local)</b></summary>
     <ul>
      <li><a href="https://mon.lyceeconnecte.fr/auth/login">mon.lyceeconnecte.fr</a></li>
      <li><a href="https://ent.l-educdenormandie.fr/auth/login">ent.l-educdenormandie.fr</a></li>
     </ul>
    </details>
  </details>

## Alternatives

- [Pronote+ / Papillon](https://github.com/PapillonApp/Papillon)
- [yNotes (Deprecated)](https://github.com/EduWireApps/ynotes)

## Ressources

Without these very useful ressources, I wouldn't be able to write this whole client by myself.

- [Pronote Protocol](https://github.com/bain3/pronotepy/blob/master/PRONOTE%20protocol.md) written by developers of `pronotepy`.
- [`pronote-api`](https://github.com/dorian-eydoux/pronote-api/tree/master/src)'s (forked/archived) source code.
- [`pronotepy`](https://github.com/bain3/pronotepy)'s source code.

## Contributing

- [`/packages`](./packages) is a good starting point if you want to navigate through Pawnote's internal source code. You'll find a README that explains what each package does.
- [`/platforms`](./platforms) is where we build the interfaces for each platforms. You may want to look at it if you want to make some UI changes.
- [`/docs`](./docs) is where I write all the documentation about the API and, later, stuff about how the app works and should be used. There's still a lot of work in progress in here.
