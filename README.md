<p align="center">
  <img src="https://raw.githubusercontent.com/kieranknight/ue-plugin-tools/master/media/icon-256.png" width="128" alt="UE Plugin Tools">
</p>

<h1 align="center">UE Plugin Tools</h1>

<p align="center">
  Register, build, package, and deploy Unreal Engine plugins — directly from the VS Code sidebar.
</p>

---

## Features

### Plugin & UE Version Registry

Keep all your plugins and engine installations in one place. The sidebar gives you a live view of everything registered.

- **Register plugins** by folder — any directory containing a `.uplugin` file
- **Register UE versions** manually or let **Discover UE Versions** scan your Epic Games folder automatically
- **Pin a default UE version to each plugin** — shown as a child item in the tree so you always know what each plugin targets. Build commands use it automatically, skipping the version picker

### Building

Build plugins against any registered UE version using Unreal's `RunUAT BuildPlugin` pipeline, with output streamed live to the **UE Plugin Tools** output channel.

- Right-click a plugin → **UE: Build Plugin**
- If a default UE version is set, the version picker is skipped entirely
- After a successful build, choose what to do next:
  - **Open Output Folder** — jump straight to the build artifacts
  - **Clean Output** — strip `Source/`, `Intermediate/`, and `.pdb` files, leaving only the distributable binaries
  - **Clean & Package** — strip, then zip the result into a versioned archive ready to ship

### Project Integration

Get your plugin into a UE project in whichever way suits the workflow:

- **Copy Plugin to Project** — copies the plugin source into `ProjectRoot/Plugins/` for standard development
- **Copy Plugin and Build** — copy then immediately build in one step
- **Link Plugin to Project** — creates a Windows directory junction at `ProjectRoot/Plugins/PluginName` pointing back to your source folder. The project always sees your latest code with no re-copy needed. No admin rights required.
- **Deploy Release to Project** — copies a built artifact folder (not the source) into any project's `Plugins/` folder for distribution

### Build Output Management

Each plugin can have multiple tracked **output folders** — the destinations your builds land in. Right-click any output folder to:

- **Open in Explorer** — open the folder in Windows Explorer
- **Clean Build Output** — strip `Source/`, `Intermediate/`, and `.pdb` files with a confirmation prompt
- **Package as Release Zip** — prompts for a version string and creates `PluginName_UEvX.Y-Z.zip`. The UE version field is pre-filled from the plugin's default if one is set

### UE Project Actions

If an output folder is inside (or near) a UE project — for example `ProjectRoot/Plugins/MyPlugin` — the extension detects the `.uproject` file and unlocks three extra right-click actions:

- **Launch UE Project** — opens the project in the Unreal Editor using the plugin's default UE version
- **Generate VS Project Files** — runs `GenerateProjectFiles.bat` to (re)generate the Visual Studio solution
- **Build Project C++** — compiles the project's C++ code via `Build.bat` without opening the editor

---

## Quick Start

1. **Open the UE Plugin Tools panel** from the Activity Bar (look for the UE glyph icon)
2. **Register a UE version** — click the search icon in the *UE Versions* panel header to auto-discover installations, or click **+** to add one manually
3. **Register a plugin** — click **+** in the *Plugins* panel header and select your plugin's root folder (the one containing the `.uplugin` file)
4. **Set a default UE version** — right-click the plugin → **Set Default UE Version**, pick from your registered versions
5. **Build** — right-click the plugin → **UE: Build Plugin**. Confirm the output path, watch the output channel, and use the post-build buttons to clean or package

---

## Commands

All commands are available via right-click context menus in the sidebar. Commands prefixed **UE:** are also available from the Command Palette (`Ctrl+Shift+P`).

### Plugin Management

| Command | Description |
|---------|-------------|
| **Add Plugin** | Register a plugin folder |
| **Remove Plugin** | Remove a plugin from the registry |
| **Set Default UE Version** | Pin a UE version to a plugin (right-click plugin or its UE version slot) |
| **Remove UE Version** *(on plugin)* | Clear the default UE version from a plugin |

### Building & Deployment

| Command | Description |
|---------|-------------|
| **UE: Build Plugin** | Build the plugin with RunUAT. Skips the version picker if a default is set |
| **UE: Copy Plugin to Project** | Copy plugin source into a UE project's `Plugins/` folder |
| **UE: Copy Plugin and Build** | Copy then build in one step |
| **UE: Link Plugin to Project** | Create a directory junction — no copying, always live source |
| **UE: Deploy Release to Project** | Copy a built artifact folder into a project's `Plugins/` folder |

### Output Folder Management

| Command | Description |
|---------|-------------|
| **Add Output Folder** | Track a build destination folder under a plugin |
| **Remove Output Folder** | Stop tracking an output folder |
| **Open in Explorer** | Open the folder in Windows Explorer |
| **Clean Build Output** | Strip `Source/`, `Intermediate/`, and `.pdb` files from the output |
| **Package as Release Zip** | Zip the output into a versioned `PluginName_UEvX.Y-Z.zip` archive |

### UE Project Actions *(on output folders near a `.uproject`)*

| Command | Description |
|---------|-------------|
| **Launch UE Project** | Open the project in Unreal Editor |
| **Generate VS Project Files** | Run `GenerateProjectFiles.bat` to regenerate the Visual Studio solution |
| **Build Project C++** | Compile the project's C++ code via `Build.bat` |

### UE Version Management

| Command | Description |
|---------|-------------|
| **Discover UE Versions** | Scan the Epic Games folder for UE installations |
| **Add UE Version** | Manually register a UE installation |
| **Remove UE Version** | Remove a UE version from the registry |
| **Refresh UE Versions** | Reload the UE Versions panel |

---

## Extension Settings

All state is stored in VS Code global settings. Avoid editing these arrays by hand — the sidebar commands keep them consistent.

| Setting | Default | Description |
|---------|---------|-------------|
| `uePluginTools.plugins` | `[]` | Registered plugin entries (managed via sidebar) |
| `uePluginTools.ueVersions` | `[]` | Registered UE engine installations (managed via sidebar) |
| `uePluginTools.epicGamesPath` | `C:\Program Files\Epic Games` | Root path scanned by **Discover UE Versions** |

---

## Requirements

- **Windows** — build and project actions rely on `.bat` files (`RunUAT.bat`, `Build.bat`, `GenerateProjectFiles.bat`) and Windows directory junctions
- **Unreal Engine** installed via the Epic Games Launcher, or at any custom path you register manually
- No additional VS Code extensions or runtime dependencies required

---

## Release Notes

### 0.2.0

- Default UE version per plugin — set once, used automatically by Build and other commands
- Post-build actions: **Clean Output** and **Clean & Package** (versioned zip)
- **Link Plugin to Project** — directory junction for always-live source
- **Clean Build Output** and **Package as Release Zip** available as standalone right-click commands on output folders
- UE project actions on output folders near a `.uproject`: **Launch**, **Generate VS Project Files**, **Build Project C++**
- Brand icon and dark navy Marketplace gallery banner

### 0.1.0

- Plugin and UE version registry with sidebar tree views
- Auto-discovery of UE installations via Epic Games folder scan
- Build plugin via RunUAT with live output streaming
- Copy plugin to project, Copy and Build, Deploy Release
- Collapsible plugin entries with tracked output folders
