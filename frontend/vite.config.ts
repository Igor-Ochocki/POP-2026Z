import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// Keep in sync with "paths" in tsconfig.app.json
const aliases = {
  '@api': './src/api',
  '@hooks': './src/hooks',
  '@views': './src/views',
  '@components': './src/components',
  '@app-types': './src/types',
  '@config': './src/config',
  '@styles': './src/styles',
  '@': './src',
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: Object.fromEntries(
      Object.entries(aliases).map(([alias, dir]) => [
        alias,
        fileURLToPath(new URL(dir, import.meta.url)),
      ]),
    ),
  },
});
