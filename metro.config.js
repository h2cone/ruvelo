const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  // Experimental: strip TS syntax with SWC first, then let Expo's Babel pipeline
  // handle router, env, React Refresh, and Worklets/Reanimated transforms.
  babelTransformerPath: require.resolve("./metro.hybrid-babel-transformer"),
};

module.exports = config;
