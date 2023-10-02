# Coin98 Wallet Selector

## Structuring:
- **apps/***: storing our application
- **packages/***: holding packages that use in project
- **packages/adapters**: holding adapters packages
- **packages/core**: for abstract, interface, constants & crypto support.

## Commit Lint
build: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
chore: add something without touching production code (Eg: update npm dependencies)
docs: Documentation only changes
feat: A new feature
fix: A bug fix
perf: A code change that improves performance
refactor: A code change that neither fixes a bug nor adds a feature
revert: Reverts a previous commit
style: Changes that do not affect the meaning of the code (Eg: adding white-space, formatting, missing semi-colons, etc)
test: Adding missing tests or correcting existing tests

# Dependencies describe
- Prefer to TurboRepo & pnpm workspace
- Project will automatically link together & make a build sequence

## Convention
- **Limit** to use library
- Eslint [standard](https://www.npmjs.com/package/eslint-config-standard)

## Command

Add new packages
```bash
pnpm add <package> <package> --filter <Project Name>
```

Run Project inside workspace.
```bash
pnpm run <Command> --filter <Project Name>
```

For example:
```bash
pnpm run dev --filter @wallet/aptos
```

For parallel: this command will run all the project that have `dev` script in `package.json`
```bash
pnpm run dev
```