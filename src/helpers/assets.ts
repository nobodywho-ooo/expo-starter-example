import { Asset } from 'expo-asset';
import { File, Paths } from 'expo-file-system';

/**
 * Resolve an asset to an on-device file path that native modules (NobodyWho)
 * can read.
 *
 * Everything is bundled from the `assets/` folder and resolved with
 * `expo-asset`, which copies the bundled file into the local cache and returns
 * a `file://` uri. NobodyWho expects a plain filesystem path, so we strip the
 * `file://` scheme.
 *
 * - **Sample media** (`image-1.png`, `image-2.png`, `audio.mp3`) live in
 *   `assets/media/` and are required directly.
 * - **GGUF models** (`chat-model.gguf`, ...) are downloaded into `assets/` by
 *   the scripts in `scripts/`. We pick them up with Metro's `require.context`,
 *   which only includes the files that actually exist — so a "chat only" setup
 *   works without the multimodal / embedding / reranker models present.
 */
const bundledMedia: Record<string, number> = {
  'image-1.png': require('@/assets/media/image-1.png'),
  'image-2.png': require('@/assets/media/image-2.png'),
  'audio.mp3': require('@/assets/media/audio.mp3'),
};

type RequireContext = {
  keys(): string[];
  (id: string): number;
};

// Metro only rewrites `require.context` when it is called on the bare `require`
// identifier, so this must stay a direct call (no aliasing). Registers every
// `assets/*.gguf` present at build time.
const modelsContext = require.context(
  '../../assets',
  false,
  /\.gguf$/,
) as unknown as RequireContext;
const bundledModels: Record<string, number> = Object.fromEntries(
  modelsContext.keys().map(key => [key.replace(/^\.\//, ''), modelsContext(key)]),
);

const stripScheme = (uri: string): string => uri.replace(/^file:\/\//, '');

export async function getAssetPath(assetName: string): Promise<string> {
  const moduleId = bundledMedia[assetName] ?? bundledModels[assetName];
  if (moduleId != null) {
    const [asset] = await Asset.loadAsync(moduleId);
    return stripScheme(asset.localUri ?? asset.uri);
  }

  // Fallback: a file the app placed in its document directory at runtime.
  const modelFile = new File(Paths.document, assetName);
  if (modelFile.exists) {
    return stripScheme(modelFile.uri);
  }

  throw new Error(
    `Asset "${assetName}" not found. Download it into the assets/ folder (see README) or place it in the document directory.`,
  );
}
