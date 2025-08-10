# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

```
C:\sources>pnpm create tauri-app
.../1988de62bed-4d48                     |   +2 +
.../1988de62bed-4d48                     | Progress: resolved 12, reused 2, downloaded 0, added 2, done
✔ Project name · tr-movie-player
✔ Identifier · com.kkt.tr-movie-player
✔ Choose which language to use for your frontend · TypeScript / JavaScript - (pnpm, yarn, npm, deno, bun)
✔ Choose your package manager · pnpm
✔ Choose your UI template · React - (https://react.dev/)
✔ Choose your UI flavor · TypeScript

Template created! To get started run:
  cd tr-movie-player
  pnpm install
  pnpm tauri android init

For Desktop development, run:
  pnpm tauri dev

For Android development, run:
  pnpm tauri android dev

```
```
pnpm add -D @types/node
```
```
 cargo tauri icon .\public\tr-movie-player.svg
```