import { defineConfig, Options } from 'tsup';

export default defineConfig((options: Options) => ({
  treeshake: true,
  splitting: true,
  entry: ['src/*.ts'],
  format: ['cjs'],
  dts: true,
  minify: true,
  clean: true,
  external: ['react', '@coin98t/wallet-adapter-base'],
  ...options,
}));