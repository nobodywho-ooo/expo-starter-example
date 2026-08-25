// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Bundle local LLM weights (GGUF) as assets so `getAssetPath` can resolve them
// to an on-device file path for NobodyWho.
config.resolver.assetExts.push('gguf');

// `src/helpers/assets.ts` uses `require.context` to pick up whichever model
// files are present in `assets/`, so partial model sets don't break the bundle.
config.transformer.unstable_allowRequireContext = true;

module.exports = config;
