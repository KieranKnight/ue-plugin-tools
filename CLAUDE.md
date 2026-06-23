# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build     # Compile via esbuild → dist/extension.js (fast bundle, no type-check)
npm run package   # vsce package → releases/ue-plugin-tools-x.x.x.vsix
```

`dist/` is gitignored — run `npm run build` before packaging.

There is no test runner or linter configured.

To type-check without bundling: `npx tsc --noEmit`

To install a built package locally in VS Code: Extensions panel → "..." → "Install from VSIX..."

## Architecture

This is a VS Code extension (TypeScript, bundled with esbuild) that manages Unreal Engine plugin workflows — register plugins and UE versions, then copy/build/deploy from the sidebar.

**Entrypoint**: `src/extension.ts` — registers two `TreeDataProvider`s, wires a `onDidChangeConfiguration` listener for tree view refresh, then delegates all command registration to `src/commands/index.ts`.

**State layer** (`src/config.ts`): All persistent state lives in VS Code global settings (`uePluginTools.plugins` and `uePluginTools.ueVersions`). `config.ts` is the single point of contact for reading/writing settings. Every entry carries a UUID `id` for stable identity. No backend, no files outside VS Code settings.

**Providers** (`src/providers/`): Thin `TreeDataProvider` wrappers — `PluginsProvider` and `UEVersionsProvider` — that read from `config.ts` on each refresh. Each provider exports its `TreeItem` subclass (`PluginItem`, `UEVersionItem`) which commands receive as context when invoked from the sidebar.

**Commands** (`src/commands/`): One file per command. Commands accept an optional `PluginItem` or `UEVersionItem` (when invoked via right-click context menu) and fall back to QuickPick prompts when invoked from the command palette. `index.ts` is the barrel that exports `registerCommands()`.

**Services** (`src/services/`):
- `pluginBuilder.ts` — spawns `RunUAT.bat BuildPlugin` as a child process, streaming stdout/stderr to the "UE Plugin Tools" output channel. Build output defaults to `<pluginPath>/Build/<UE_Version>/`.
- `fileCopier.ts` — wraps `fs.promises.cp` (recursive) with a VS Code progress notification.
- `ueDiscovery.ts` — scans the Epic Games directory for `UE_x.x` folders containing `Engine/Build/BatchFiles/RunUAT.bat`.

**Two distinct copy workflows**:
- `copyPluginToProject` — copies plugin *source* into a UE project's `Plugins/` folder for development.
- `deployRelease` — copies a *built artifact* folder into a UE project's `Plugins/` folder for distribution. It does not know about registered plugins — the user picks any folder.
- `copyAndBuild` — chains `copyPluginToProject` then `buildPlugin` (wired in `commands/index.ts`).
