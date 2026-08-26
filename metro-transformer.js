// Custom Metro transformer that lets us bundle very large binary assets
// (our multi-hundred-MB `.gguf` model weights) from the `assets/` folder.
//
// Metro's transform worker unconditionally runs `data.toString('utf8')` on
// every file *before* it branches on the file type. For asset files the decoded
// string is never used — the asset transformer reads the file from disk by path
// and only needs its byte length — but V8 cannot create a string longer than
// `0x1fffffe8` (~512MB) characters, so any single asset above that size throws:
//
//   Error: Cannot create a string longer than 0x1fffffe8 characters
//
// (This is a *different, lower* limit than the 2 GiB `fs.readFile` cap.)
//
// We delegate to Expo's default transformer, but for large binary assets we hand
// the worker a shim that reports the real byte length while decoding to an empty
// string. The asset is still copied and resolved exactly as normal — we only
// skip the wasteful (and impossible) UTF-8 decode.
const expoTransformer = require('@expo/metro-config/build/transform-worker/transform-worker');

// V8's maximum string length. `Buffer.toString('utf8')` throws once a buffer is
// large enough that the decoded string could exceed this.
const V8_MAX_STRING_LENGTH = 0x1fffffe8;

function isLargeBinaryAsset(filename, data) {
  // Model weights are always routed around the UTF-8 decode.
  if (filename.endsWith('.gguf')) return true;
  // Safety net for any other asset big enough to overflow the string limit.
  return typeof data?.length === 'number' && data.length >= V8_MAX_STRING_LENGTH;
}

async function transform(config, projectRoot, filename, data, options) {
  if (options.type === 'asset' && isLargeBinaryAsset(filename, data)) {
    const shim = {
      // Decoded source is unused for assets; return empty instead of throwing.
      toString: () => '',
      // Keep the real byte length so `inputFileSize` stays correct.
      length: typeof data?.length === 'number' ? data.length : 0,
    };
    return expoTransformer.transform(config, projectRoot, filename, shim, options);
  }

  return expoTransformer.transform(config, projectRoot, filename, data, options);
}

module.exports = { ...expoTransformer, transform };
