var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) =>
  key in obj
    ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value })
    : (obj[key] = value);
var __spreadValues = (a, b) => {
  for (var prop in (b ||= {})) if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop]);
    }
  return a;
};

// tsup.config.ts
import { defineConfig } from 'tsup';
var tsup_config_default = defineConfig(options =>
  __spreadValues(
    {
      treeshake: true,
      splitting: true,
      entry: ['src/*.ts'],
      format: ['esm'],
      dts: true,
      minify: true,
      clean: true,
      external: ['react', '@coin98t/wallet-adapter-base'],
    },
    options,
  ),
);
export { tsup_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidHN1cC5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiL1VzZXJzL2J0bG1vLmhvYW5ncXVhbmdodXkvRGVza3RvcC9Db2luOTgtQWRhcHRlci9jb2luOTgtd2FsbGV0LXNlbGVjdG9yL3BhY2thZ2VzL3dhbGxldHMvcGhhbnRvbS9zb2xhbmEvdHN1cC5jb25maWcudHNcIjtjb25zdCBfX2luamVjdGVkX2Rpcm5hbWVfXyA9IFwiL1VzZXJzL2J0bG1vLmhvYW5ncXVhbmdodXkvRGVza3RvcC9Db2luOTgtQWRhcHRlci9jb2luOTgtd2FsbGV0LXNlbGVjdG9yL3BhY2thZ2VzL3dhbGxldHMvcGhhbnRvbS9zb2xhbmFcIjtjb25zdCBfX2luamVjdGVkX2ltcG9ydF9tZXRhX3VybF9fID0gXCJmaWxlOi8vL1VzZXJzL2J0bG1vLmhvYW5ncXVhbmdodXkvRGVza3RvcC9Db2luOTgtQWRhcHRlci9jb2luOTgtd2FsbGV0LXNlbGVjdG9yL3BhY2thZ2VzL3dhbGxldHMvcGhhbnRvbS9zb2xhbmEvdHN1cC5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIE9wdGlvbnMgfSBmcm9tICd0c3VwJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKChvcHRpb25zOiBPcHRpb25zKSA9PiAoe1xuICB0cmVlc2hha2U6IHRydWUsXG4gIHNwbGl0dGluZzogdHJ1ZSxcbiAgZW50cnk6IFsnc3JjLyoudHMnXSxcbiAgZm9ybWF0OiBbJ2VzbSddLFxuICBkdHM6IHRydWUsXG4gIG1pbmlmeTogdHJ1ZSxcbiAgY2xlYW46IHRydWUsXG4gIGV4dGVybmFsOiBbJ3JlYWN0JywgJ0Bjb2luOTh4L3dhbGxldC1hZGFwdGVyLWJhc2UnXSxcbiAgLi4ub3B0aW9ucyxcbn0pKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFzYyxTQUFTLG9CQUE2QjtBQUU1ZSxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxZQUFzQjtBQUFBLEVBQ2pELFdBQVc7QUFBQSxFQUNYLFdBQVc7QUFBQSxFQUNYLE9BQU8sQ0FBQyxVQUFVO0FBQUEsRUFDbEIsUUFBUSxDQUFDLEtBQUs7QUFBQSxFQUNkLEtBQUs7QUFBQSxFQUNMLFFBQVE7QUFBQSxFQUNSLE9BQU87QUFBQSxFQUNQLFVBQVUsQ0FBQyxTQUFTLDhCQUE4QjtBQUFBLEdBQy9DLFFBQ0g7IiwKICAibmFtZXMiOiBbXQp9Cg==
