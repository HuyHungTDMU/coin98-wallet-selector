var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b ||= {})
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};

// tsup.config.ts
import { defineConfig } from "tsup";
var tsup_config_default = defineConfig((options) => __spreadValues({
  treeshake: true,
  splitting: true,
  entry: ["src/*.ts"],
  format: ["esm"],
  dts: true,
  minify: true,
  clean: true,
  external: ["react", "@coin98t/wallet-adapter-base"]
}, options));
export {
  tsup_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidHN1cC5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiL1VzZXJzL2J0bG1vLmhvYW5ncXVhbmdodXkvRGVza3RvcC9DdXJyZW50IFByb2plY3QvY29pbjk4LXdhbGxldC1zZWxlY3Rvci9wYWNrYWdlcy93YWxsZXRzL3dhbGxldGNvbm5lY3QvZXRoZXJldW0vdHN1cC5jb25maWcudHNcIjtjb25zdCBfX2luamVjdGVkX2Rpcm5hbWVfXyA9IFwiL1VzZXJzL2J0bG1vLmhvYW5ncXVhbmdodXkvRGVza3RvcC9DdXJyZW50IFByb2plY3QvY29pbjk4LXdhbGxldC1zZWxlY3Rvci9wYWNrYWdlcy93YWxsZXRzL3dhbGxldGNvbm5lY3QvZXRoZXJldW1cIjtjb25zdCBfX2luamVjdGVkX2ltcG9ydF9tZXRhX3VybF9fID0gXCJmaWxlOi8vL1VzZXJzL2J0bG1vLmhvYW5ncXVhbmdodXkvRGVza3RvcC9DdXJyZW50JTIwUHJvamVjdC9jb2luOTgtd2FsbGV0LXNlbGVjdG9yL3BhY2thZ2VzL3dhbGxldHMvd2FsbGV0Y29ubmVjdC9ldGhlcmV1bS90c3VwLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZywgT3B0aW9ucyB9IGZyb20gJ3RzdXAnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKG9wdGlvbnM6IE9wdGlvbnMpID0+ICh7XG4gIHRyZWVzaGFrZTogdHJ1ZSxcbiAgc3BsaXR0aW5nOiB0cnVlLFxuICBlbnRyeTogWydzcmMvKi50cyddLFxuICBmb3JtYXQ6IFsnZXNtJ10sXG4gIGR0czogdHJ1ZSxcbiAgbWluaWZ5OiB0cnVlLFxuICBjbGVhbjogdHJ1ZSxcbiAgZXh0ZXJuYWw6IFsncmVhY3QnLCAnQGNvaW45OHQvd2FsbGV0LWFkYXB0ZXItYmFzZSddLFxuICAuLi5vcHRpb25zLFxufSkpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQW1lLFNBQVMsb0JBQTZCO0FBRXpnQixJQUFPLHNCQUFRLGFBQWEsQ0FBQyxZQUFzQjtBQUFBLEVBQ2pELFdBQVc7QUFBQSxFQUNYLFdBQVc7QUFBQSxFQUNYLE9BQU8sQ0FBQyxVQUFVO0FBQUEsRUFDbEIsUUFBUSxDQUFDLEtBQUs7QUFBQSxFQUNkLEtBQUs7QUFBQSxFQUNMLFFBQVE7QUFBQSxFQUNSLE9BQU87QUFBQSxFQUNQLFVBQVUsQ0FBQyxTQUFTLDhCQUE4QjtBQUFBLEdBQy9DLFFBQ0g7IiwKICAibmFtZXMiOiBbXQp9Cg==
