// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Bundle local LLM weights (GGUF) as assets so `getAssetPath` can resolve them
// to an on-device file path for NobodyWho.
config.resolver.assetExts.push('gguf');

// GGUF weights can be several hundred MB — larger than V8's ~512MB max string
// length. Metro's default transform worker decodes every file to a UTF-8 string
// before it handles assets, which throws on these files. This custom transformer
// skips that (unused) decode for large binary assets so they can be bundled.
// See metro-transformer.js for the full explanation.
config.transformerPath = require.resolve('./metro-transformer');

// `src/helpers/assets.ts` uses `require.context` to pick up whichever model
// files are present in `assets/`, so partial model sets don't break the bundle.
config.transformer.unstable_allowRequireContext = true;

module.exports = config;
