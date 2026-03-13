# Ruvelo

Ruvelo is a stylish running tracker built with Expo and React Native.
It helps you start a run fast, keep tracking while the screen is off, and finish with a summary screen that feels a little like a game result.

## Features

- See your recent runs and 7-day distance at a glance
- Track time, distance, pace, and route in real time
- Keep recording in the background on iOS and Android
- Save runs locally with SQLite
- Review each run on a route map and share the summary

## Tech Stack

- Expo
- React Native
- Expo Router
- TypeScript
- Expo Location and Task Manager
- Expo SQLite
- React Native Maps
- React Native Reanimated

## Getting Started

Make sure you have Node.js and npm installed.

```bash
npm install
npm start
```

You can also launch a specific platform:

```bash
npm run android
npm run ios
npm run web
```

## Code Quality

Ruvelo uses Oxc for formatting, linting, and editor diagnostics. Expo runtime bundling still stays on Metro and Babel.

```bash
npm run lint
npm run format:check
npm run check
npm run check:fix
npm run typecheck
```

If you use VS Code, install the recommended `oxc.oxc-vscode` extension so the workspace settings in `.vscode/` can format and fix supported files on save.

## Notes

- Ruvelo needs location permission to record your runs.
- Background tracking is available on iOS and Android.
- On the web, Ruvelo uses browser geolocation and does not continue tracking in the background.
- Run history is stored locally on the device.

## License

MIT. See [LICENSE](LICENSE).
