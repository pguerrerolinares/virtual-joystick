import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'tests/**/*'],
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      // Single entry for UMD compatibility
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VirtualJoystick',
      formats: ['es', 'umd'],
      fileName: (format) => {
        return format === 'es' ? 'index.mjs' : 'index.umd.js';
      },
    },
    rollupOptions: {
      output: {
        globals: {},
      },
    },
    sourcemap: true,
    minify: 'esbuild',
  },
  server: {
    open: '/demo/index.html',
  },
});
