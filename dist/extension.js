"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode23 = __toESM(require("vscode"));

// src/providers/pluginsProvider.ts
var vscode2 = __toESM(require("vscode"));
var path2 = __toESM(require("path"));

// src/config.ts
var vscode = __toESM(require("vscode"));
var crypto = __toESM(require("crypto"));
function cfg() {
  return vscode.workspace.getConfiguration("uePluginTools");
}
function getPlugins() {
  return cfg().get("plugins", []);
}
async function addPlugin(entry) {
  const plugins = getPlugins();
  const newEntry = { id: crypto.randomUUID(), ...entry };
  await cfg().update("plugins", [...plugins, newEntry], vscode.ConfigurationTarget.Global);
  return newEntry;
}
async function removePlugin(id) {
  const plugins = getPlugins().filter((p) => p.id !== id);
  await cfg().update("plugins", plugins, vscode.ConfigurationTarget.Global);
}
function getUEVersions() {
  return cfg().get("ueVersions", []);
}
async function addUEVersion(entry) {
  const versions = getUEVersions();
  const newEntry = { id: crypto.randomUUID(), ...entry };
  await cfg().update("ueVersions", [...versions, newEntry], vscode.ConfigurationTarget.Global);
  return newEntry;
}
async function removeUEVersion(id) {
  const versions = getUEVersions().filter((v) => v.id !== id);
  await cfg().update("ueVersions", versions, vscode.ConfigurationTarget.Global);
}
async function mergeUEVersions(discovered) {
  const existing = getUEVersions();
  const existingPaths = new Set(existing.map((v) => v.installPath.toLowerCase()));
  const toAdd = discovered.filter((d) => !existingPaths.has(d.installPath.toLowerCase()));
  const newEntries = toAdd.map((d) => ({ id: crypto.randomUUID(), ...d }));
  if (newEntries.length > 0) {
    await cfg().update("ueVersions", [...existing, ...newEntries], vscode.ConfigurationTarget.Global);
  }
  return newEntries.length;
}
async function addOutputFolder(pluginId, folderPath) {
  const plugins = getPlugins();
  const updated = plugins.map((p) => {
    if (p.id !== pluginId) return p;
    const existing = p.outputFolders ?? [];
    if (existing.includes(folderPath)) return p;
    return { ...p, outputFolders: [...existing, folderPath] };
  });
  await cfg().update("plugins", updated, vscode.ConfigurationTarget.Global);
}
async function removeOutputFolder(pluginId, folderPath) {
  const plugins = getPlugins();
  const updated = plugins.map((p) => {
    if (p.id !== pluginId) return p;
    return { ...p, outputFolders: (p.outputFolders ?? []).filter((f) => f !== folderPath) };
  });
  await cfg().update("plugins", updated, vscode.ConfigurationTarget.Global);
}
async function setPluginUEVersion(pluginId, ueVersionId) {
  const plugins = getPlugins();
  const updated = plugins.map((p) => p.id !== pluginId ? p : { ...p, defaultUEVersionId: ueVersionId });
  await cfg().update("plugins", updated, vscode.ConfigurationTarget.Global);
}
async function clearPluginUEVersion(pluginId) {
  const plugins = getPlugins();
  const updated = plugins.map((p) => {
    if (p.id !== pluginId) return p;
    const { defaultUEVersionId: _, ...rest } = p;
    return rest;
  });
  await cfg().update("plugins", updated, vscode.ConfigurationTarget.Global);
}
function getEpicGamesPath() {
  return cfg().get("epicGamesPath", "C:\\Program Files\\Epic Games");
}

// src/services/uprojectFinder.ts
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
function findUProject(startPath, maxLevels = 4) {
  let dir = startPath;
  for (let i = 0; i < maxLevels; i++) {
    try {
      const match = fs.readdirSync(dir).find((f) => f.endsWith(".uproject"));
      if (match) return path.join(dir, match);
    } catch {
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

// src/providers/pluginsProvider.ts
var PluginItem = class extends vscode2.TreeItem {
  constructor(entry) {
    super(entry.name, vscode2.TreeItemCollapsibleState.Collapsed);
    this.entry = entry;
    this.description = entry.path;
    this.tooltip = entry.path;
    this.contextValue = "plugin";
    this.iconPath = new vscode2.ThemeIcon("package");
  }
};
var PluginUEVersionItem = class extends vscode2.TreeItem {
  constructor(pluginId, ueVersionName, ueVersionInstallPath) {
    const isSet = !!ueVersionName;
    super(isSet ? ueVersionName : "No default UE version", vscode2.TreeItemCollapsibleState.None);
    this.pluginId = pluginId;
    this.description = isSet ? ueVersionInstallPath : "right-click plugin to set";
    this.tooltip = isSet ? ueVersionInstallPath : "No default UE version set";
    this.contextValue = isSet ? "pluginUEVersion" : "noPluginUEVersion";
    this.iconPath = new vscode2.ThemeIcon(isSet ? "versions" : "circle-slash");
  }
};
var OutputFolderItem = class extends vscode2.TreeItem {
  constructor(folderPath, pluginId, uprojectPath) {
    super(path2.basename(folderPath), vscode2.TreeItemCollapsibleState.None);
    this.folderPath = folderPath;
    this.pluginId = pluginId;
    this.uprojectPath = uprojectPath;
    this.description = folderPath;
    this.tooltip = folderPath;
    this.contextValue = uprojectPath ? "outputFolderWithProject" : "outputFolder";
    this.iconPath = new vscode2.ThemeIcon(uprojectPath ? "root-folder" : "folder");
  }
};
var PluginsProvider = class {
  constructor() {
    this._onDidChangeTreeData = new vscode2.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }
  refresh() {
    this._onDidChangeTreeData.fire();
  }
  getTreeItem(element) {
    return element;
  }
  getChildren(element) {
    if (!element) {
      return getPlugins().map((p) => new PluginItem(p));
    }
    if (element instanceof PluginItem) {
      const versions = getUEVersions();
      const resolvedVersion = element.entry.defaultUEVersionId ? versions.find((v) => v.id === element.entry.defaultUEVersionId) : void 0;
      const ueVersionItem = new PluginUEVersionItem(
        element.entry.id,
        resolvedVersion?.name,
        resolvedVersion?.installPath
      );
      const folders = element.entry.outputFolders ?? [];
      const folderItems = folders.length === 0 ? [(() => {
        const p = new vscode2.TreeItem("No output folders \u2014 right-click plugin to add one");
        p.contextValue = "noOutputFolder";
        return p;
      })()] : folders.map((f) => new OutputFolderItem(f, element.entry.id, findUProject(f) ?? void 0));
      return [ueVersionItem, ...folderItems];
    }
    return [];
  }
};

// src/providers/ueVersionsProvider.ts
var vscode3 = __toESM(require("vscode"));
var UEVersionItem = class extends vscode3.TreeItem {
  constructor(entry) {
    super(entry.name, vscode3.TreeItemCollapsibleState.None);
    this.entry = entry;
    this.description = entry.installPath;
    this.tooltip = entry.installPath;
    this.contextValue = "ueVersion";
    this.iconPath = new vscode3.ThemeIcon("versions");
  }
};
var UEVersionsProvider = class {
  constructor() {
    this._onDidChangeTreeData = new vscode3.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }
  refresh() {
    this._onDidChangeTreeData.fire();
  }
  getTreeItem(element) {
    return element;
  }
  getChildren() {
    return getUEVersions().map((v) => new UEVersionItem(v));
  }
};

// src/commands/addPlugin.ts
var vscode4 = __toESM(require("vscode"));
var fs2 = __toESM(require("fs"));
var path3 = __toESM(require("path"));
async function addPluginCommand(provider) {
  const uris = await vscode4.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    title: "Select plugin folder (containing the .uplugin file)"
  });
  if (!uris || uris.length === 0) return;
  const pluginPath = uris[0].fsPath;
  let upluginName;
  try {
    const files = fs2.readdirSync(pluginPath).filter((f) => f.endsWith(".uplugin"));
    if (files.length === 0) {
      vscode4.window.showErrorMessage(`No .uplugin file found in: ${pluginPath}`);
      return;
    }
    upluginName = path3.basename(files[0], ".uplugin");
  } catch (err) {
    vscode4.window.showErrorMessage(`UE Plugin Tools: ${err.message}`);
    return;
  }
  const name = await vscode4.window.showInputBox({
    prompt: "Plugin name",
    value: upluginName,
    validateInput: (v) => v.trim() ? null : "Name cannot be empty"
  });
  if (!name) return;
  await addPlugin({ name: name.trim(), path: pluginPath });
  provider.refresh();
  vscode4.window.showInformationMessage(`Added plugin: ${name}`);
}

// src/commands/removePlugin.ts
var vscode5 = __toESM(require("vscode"));
async function removePluginCommand(item, provider) {
  if (!item) return;
  const confirm = await vscode5.window.showWarningMessage(
    `Remove "${item.entry.name}" from the plugin list?`,
    { modal: true },
    "Remove"
  );
  if (confirm !== "Remove") return;
  await removePlugin(item.entry.id);
  provider.refresh();
}

// src/commands/addUEVersion.ts
var vscode6 = __toESM(require("vscode"));
var fs4 = __toESM(require("fs"));
var path5 = __toESM(require("path"));

// src/services/ueDiscovery.ts
var fs3 = __toESM(require("fs"));
var path4 = __toESM(require("path"));
function discoverUEVersions(epicGamesPath) {
  if (!fs3.existsSync(epicGamesPath)) {
    return [];
  }
  let entries;
  try {
    entries = fs3.readdirSync(epicGamesPath, { withFileTypes: true });
  } catch {
    return [];
  }
  const results = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const match = entry.name.match(/^UE_(\d+\.\d+)$/);
    if (!match) continue;
    const version = match[1];
    const installPath = path4.join(epicGamesPath, entry.name);
    const runUAT = path4.join(installPath, "Engine", "Build", "BatchFiles", "RunUAT.bat");
    if (!fs3.existsSync(runUAT)) continue;
    results.push({
      name: `UE ${version}`,
      version,
      installPath
    });
  }
  results.sort((a, b) => a.version.localeCompare(b.version, void 0, { numeric: true }));
  return results;
}
function runUATPath(installPath) {
  return path4.join(installPath, "Engine", "Build", "BatchFiles", "RunUAT.bat");
}

// src/commands/addUEVersion.ts
async function addUEVersionCommand(provider) {
  const uris = await vscode6.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    title: "Select UE installation folder (e.g. C:\\Program Files\\Epic Games\\UE_5.7)"
  });
  if (!uris || uris.length === 0) return;
  const installPath = uris[0].fsPath;
  const runUAT = runUATPath(installPath);
  if (!fs4.existsSync(runUAT)) {
    vscode6.window.showErrorMessage(
      `RunUAT.bat not found at ${runUAT}. Is this a valid UE installation?`
    );
    return;
  }
  const folderName = path5.basename(installPath);
  const versionMatch = folderName.match(/(\d+\.\d+)/);
  const detectedVersion = versionMatch ? versionMatch[1] : "";
  const version = await vscode6.window.showInputBox({
    prompt: "UE version (e.g. 5.7)",
    value: detectedVersion,
    validateInput: (v) => v.trim() ? null : "Version cannot be empty"
  });
  if (!version) return;
  await addUEVersion({ name: `UE ${version.trim()}`, version: version.trim(), installPath });
  provider.refresh();
  vscode6.window.showInformationMessage(`Added UE ${version}`);
}

// src/commands/removeUEVersion.ts
var vscode7 = __toESM(require("vscode"));
async function removeUEVersionCommand(item, provider) {
  if (!item) return;
  const confirm = await vscode7.window.showWarningMessage(
    `Remove "${item.entry.name}" from the UE versions list?`,
    { modal: true },
    "Remove"
  );
  if (confirm !== "Remove") return;
  await removeUEVersion(item.entry.id);
  provider.refresh();
}

// src/commands/discoverUEVersions.ts
var vscode8 = __toESM(require("vscode"));
async function discoverUEVersionsCommand(provider) {
  const epicPath = getEpicGamesPath();
  const found = discoverUEVersions(epicPath);
  if (found.length === 0) {
    vscode8.window.showWarningMessage(
      `No UE installations found in: ${epicPath}

Check the uePluginTools.epicGamesPath setting.`
    );
    return;
  }
  const added = await mergeUEVersions(found);
  provider.refresh();
  if (added === 0) {
    vscode8.window.showInformationMessage(
      `Found ${found.length} installation(s) \u2014 all already registered.`
    );
  } else {
    vscode8.window.showInformationMessage(
      `Found ${found.length} installation(s), added ${added} new.`
    );
  }
}

// src/commands/copyPluginToProject.ts
var vscode10 = __toESM(require("vscode"));
var fs6 = __toESM(require("fs"));
var path7 = __toESM(require("path"));

// src/services/fileCopier.ts
var vscode9 = __toESM(require("vscode"));
var fs5 = __toESM(require("fs"));
var path6 = __toESM(require("path"));
async function copyDir(src, dest, label) {
  return vscode9.window.withProgress(
    { location: vscode9.ProgressLocation.Notification, title: label, cancellable: false },
    async () => {
      try {
        fs5.mkdirSync(path6.dirname(dest), { recursive: true });
        await fs5.promises.cp(src, dest, { recursive: true, force: true });
        return true;
      } catch (err) {
        vscode9.window.showErrorMessage(`UE Plugin Tools: Copy failed \u2014 ${err.message}`);
        return false;
      }
    }
  );
}

// src/commands/copyPluginToProject.ts
async function pickPlugin() {
  const plugins = getPlugins();
  if (plugins.length === 0) {
    vscode10.window.showWarningMessage("No plugins registered. Add one via the Plugins sidebar.");
    return void 0;
  }
  const pick = await vscode10.window.showQuickPick(
    plugins.map((p) => ({ label: p.name, description: p.path, pluginPath: p.path, name: p.name })),
    { title: "Select plugin" }
  );
  return pick;
}
async function pickProject() {
  const uris = await vscode10.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    title: "Select target UE project folder (containing the .uproject file)"
  });
  if (!uris || uris.length === 0) return void 0;
  const projectPath = uris[0].fsPath;
  const hasUproject = fs6.readdirSync(projectPath).some((f) => f.endsWith(".uproject"));
  if (!hasUproject) {
    vscode10.window.showWarningMessage(
      `No .uproject file found in: ${projectPath}. Are you sure this is a UE project folder?`
    );
  }
  return projectPath;
}
async function copyPluginToProjectCommand(item) {
  let pluginName;
  let pluginPath;
  if (item) {
    pluginName = item.entry.name;
    pluginPath = item.entry.path;
  } else {
    const picked = await pickPlugin();
    if (!picked) return null;
    pluginName = picked.name;
    pluginPath = picked.pluginPath;
  }
  const projectPath = await pickProject();
  if (!projectPath) return null;
  const dest = path7.join(projectPath, "Plugins", pluginName);
  const ok = await copyDir(pluginPath, dest, `Copying ${pluginName} to project\u2026`);
  if (ok) {
    vscode10.window.showInformationMessage(`Copied ${pluginName} \u2192 ${dest}`);
    return dest;
  }
  return null;
}

// src/commands/buildPlugin.ts
var vscode12 = __toESM(require("vscode"));
var path10 = __toESM(require("path"));

// src/services/pluginBuilder.ts
var vscode11 = __toESM(require("vscode"));
var fs7 = __toESM(require("fs"));
var cp = __toESM(require("child_process"));
var path8 = __toESM(require("path"));
var outputChannel;
function getChannel() {
  if (!outputChannel) {
    outputChannel = vscode11.window.createOutputChannel("UE Plugin Tools");
  }
  return outputChannel;
}
function findUplugin(pluginDir) {
  try {
    const files = fs7.readdirSync(pluginDir).filter((f) => f.endsWith(".uplugin"));
    return files.length > 0 ? path8.join(pluginDir, files[0]) : null;
  } catch {
    return null;
  }
}
async function buildPlugin(pluginPath, runUAT, outputPath) {
  const uplugin = findUplugin(pluginPath);
  if (!uplugin) {
    vscode11.window.showErrorMessage(`UE Plugin Tools: No .uplugin file found in ${pluginPath}`);
    return false;
  }
  if (!fs7.existsSync(runUAT)) {
    vscode11.window.showErrorMessage(`UE Plugin Tools: RunUAT.bat not found at ${runUAT}`);
    return false;
  }
  const channel = getChannel();
  channel.clear();
  channel.show(true);
  channel.appendLine(`Building: ${path8.basename(uplugin)}`);
  channel.appendLine(`Output:   ${outputPath}`);
  channel.appendLine("\u2500".repeat(60));
  const args = [
    "BuildPlugin",
    `-Plugin="${uplugin}"`,
    `-Package="${outputPath}"`,
    "-TargetPlatforms=Win64"
  ];
  return vscode11.window.withProgress(
    {
      location: vscode11.ProgressLocation.Notification,
      title: `Building ${path8.basename(pluginPath)}\u2026`,
      cancellable: true
    },
    (_progress, token) => new Promise((resolve) => {
      const proc = cp.spawn(`"${runUAT}"`, args, { shell: true });
      token.onCancellationRequested(() => {
        proc.kill();
        channel.appendLine("\n[Cancelled by user]");
        resolve(false);
      });
      proc.stdout?.on("data", (data) => channel.append(data.toString()));
      proc.stderr?.on("data", (data) => channel.append(data.toString()));
      proc.on("close", (code) => {
        channel.appendLine("\u2500".repeat(60));
        if (code === 0) {
          channel.appendLine("[Build succeeded]");
          resolve(true);
        } else {
          channel.appendLine(`[Build failed \u2014 exit code ${code}]`);
          vscode11.window.showErrorMessage(
            `Build failed (exit ${code}). See the UE Plugin Tools output channel for details.`
          );
          resolve(false);
        }
      });
      proc.on("error", (err) => {
        channel.appendLine(`[Process error: ${err.message}]`);
        vscode11.window.showErrorMessage(`UE Plugin Tools: ${err.message}`);
        resolve(false);
      });
    })
  );
}

// src/services/buildCleaner.ts
var fs8 = __toESM(require("fs"));
var path9 = __toESM(require("path"));
var cp2 = __toESM(require("child_process"));
async function cleanBuildOutput(outputPath) {
  const result = { removedSource: false, removedIntermediate: false, pdbCount: 0 };
  const sourceDir = path9.join(outputPath, "Source");
  if (fs8.existsSync(sourceDir)) {
    try {
      fs8.rmSync(sourceDir, { recursive: true, force: true });
      result.removedSource = true;
    } catch {
    }
  }
  const intermediateDir = path9.join(outputPath, "Intermediate");
  if (fs8.existsSync(intermediateDir)) {
    try {
      fs8.rmSync(intermediateDir, { recursive: true, force: true });
      result.removedIntermediate = true;
    } catch {
    }
  }
  const binariesDir = path9.join(outputPath, "Binaries");
  if (fs8.existsSync(binariesDir)) {
    result.pdbCount = deletePdbs(binariesDir);
  }
  return result;
}
function deletePdbs(dir) {
  let count = 0;
  try {
    for (const entry of fs8.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path9.join(dir, entry.name);
      if (entry.isDirectory()) {
        count += deletePdbs(fullPath);
      } else if (entry.name.endsWith(".pdb")) {
        try {
          fs8.unlinkSync(fullPath);
          count++;
        } catch {
        }
      }
    }
  } catch {
  }
  return count;
}
function packageRelease(outputPath, pluginName, ueVersion, appVersion) {
  return new Promise((resolve, reject) => {
    const stageDir = path9.join(outputPath, pluginName);
    const zipName = `${pluginName}_UE${ueVersion}-${appVersion}.zip`;
    const zipPath = path9.join(outputPath, zipName);
    try {
      fs8.mkdirSync(stageDir, { recursive: true });
      for (const entry of fs8.readdirSync(outputPath)) {
        if (entry === pluginName) continue;
        fs8.renameSync(path9.join(outputPath, entry), path9.join(stageDir, entry));
      }
    } catch (err) {
      return reject(new Error(`Staging failed: ${err.message}`));
    }
    const script = `Compress-Archive -Path '${stageDir.replace(/'/g, "''")}' -DestinationPath '${zipPath.replace(/'/g, "''")}' -Force`;
    cp2.exec(`powershell -NoProfile -Command "${script}"`, (err) => {
      if (err) {
        return reject(new Error(`Zip failed: ${err.message}`));
      }
      try {
        fs8.rmSync(stageDir, { recursive: true, force: true });
      } catch {
      }
      resolve(zipPath);
    });
  });
}

// src/commands/buildPlugin.ts
async function buildPluginCommand(item) {
  const plugins = getPlugins();
  const versions = getUEVersions();
  if (versions.length === 0) {
    vscode12.window.showWarningMessage(
      'No UE versions registered. Use "Discover UE Versions" or add one manually.'
    );
    return false;
  }
  let pluginName;
  let pluginPath;
  let defaultUEVersionId;
  if (item) {
    pluginName = item.entry.name;
    pluginPath = item.entry.path;
    defaultUEVersionId = item.entry.defaultUEVersionId;
  } else {
    if (plugins.length === 0) {
      vscode12.window.showWarningMessage("No plugins registered. Add one via the Plugins sidebar.");
      return false;
    }
    const pick = await vscode12.window.showQuickPick(
      plugins.map((p) => ({ label: p.name, description: p.path, pluginPath: p.path, name: p.name, defaultUEVersionId: p.defaultUEVersionId })),
      { title: "Select plugin to build" }
    );
    if (!pick) return false;
    pluginName = pick.name;
    pluginPath = pick.pluginPath;
    defaultUEVersionId = pick.defaultUEVersionId;
  }
  let resolvedVersion;
  if (defaultUEVersionId) {
    resolvedVersion = versions.find((v) => v.id === defaultUEVersionId);
  }
  let ueVersionName;
  let installPath;
  if (resolvedVersion) {
    ueVersionName = resolvedVersion.name;
    installPath = resolvedVersion.installPath;
  } else {
    const versionPick = await vscode12.window.showQuickPick(
      versions.map((v) => ({ label: v.name, description: v.installPath, installPath: v.installPath, version: v.version })),
      { title: "Select UE version to build against" }
    );
    if (!versionPick) return false;
    ueVersionName = versionPick.label;
    installPath = versionPick.installPath;
  }
  const defaultOutput = path10.join(pluginPath, "Build", ueVersionName.replace(/\s/g, "_"));
  const outputPath = await vscode12.window.showInputBox({
    prompt: "Output folder for the built plugin",
    value: defaultOutput,
    validateInput: (v) => v.trim() ? null : "Output path cannot be empty"
  });
  if (!outputPath) return false;
  const success = await buildPlugin(pluginPath, runUATPath(installPath), outputPath.trim());
  if (success) {
    const ueVersionShort = resolvedVersion?.version ?? ueVersionName.replace(/^UE\s*/i, "");
    const action = await vscode12.window.showInformationMessage(
      `Build succeeded: ${pluginName} (${ueVersionName})`,
      "Open Output Folder",
      "Clean Output",
      "Clean & Package"
    );
    if (action === "Open Output Folder") {
      vscode12.env.openExternal(vscode12.Uri.file(outputPath.trim()));
    } else if (action === "Clean Output") {
      const result = await cleanBuildOutput(outputPath.trim());
      vscode12.window.showInformationMessage(
        `Cleaned: ${[
          result.removedSource && "Source/",
          result.removedIntermediate && "Intermediate/",
          result.pdbCount > 0 && `${result.pdbCount} .pdb file(s)`
        ].filter(Boolean).join(", ") || "nothing to remove"}`
      );
    } else if (action === "Clean & Package") {
      await cleanBuildOutput(outputPath.trim());
      const appVersion = await vscode12.window.showInputBox({
        prompt: "Release version (e.g. 1.0.0)",
        placeHolder: "1.0.0",
        validateInput: (v) => v.trim() ? null : "Version cannot be empty"
      });
      if (!appVersion) return success;
      try {
        const zipPath = await packageRelease(outputPath.trim(), pluginName, ueVersionShort, appVersion.trim());
        const open = await vscode12.window.showInformationMessage(
          `Packaged: ${path10.basename(zipPath)}`,
          "Open Folder"
        );
        if (open === "Open Folder") {
          vscode12.env.openExternal(vscode12.Uri.file(path10.dirname(zipPath)));
        }
      } catch (err) {
        vscode12.window.showErrorMessage(`Packaging failed: ${err.message}`);
      }
    }
  }
  return success;
}

// src/commands/deployRelease.ts
var vscode13 = __toESM(require("vscode"));
var fs9 = __toESM(require("fs"));
var path11 = __toESM(require("path"));
async function deployReleaseCommand() {
  const sourceUris = await vscode13.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    title: "Select built plugin folder (distributable artifacts)"
  });
  if (!sourceUris || sourceUris.length === 0) return;
  const sourcePath = sourceUris[0].fsPath;
  const pluginName = path11.basename(sourcePath);
  const projectUris = await vscode13.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    title: "Select target UE project folder"
  });
  if (!projectUris || projectUris.length === 0) return;
  const projectPath = projectUris[0].fsPath;
  const hasUproject = fs9.readdirSync(projectPath).some((f) => f.endsWith(".uproject"));
  if (!hasUproject) {
    vscode13.window.showWarningMessage(
      `No .uproject found in: ${projectPath}. Are you sure this is a UE project folder?`
    );
  }
  const dest = path11.join(projectPath, "Plugins", pluginName);
  const ok = await copyDir(sourcePath, dest, `Deploying ${pluginName} to project\u2026`);
  if (ok) {
    vscode13.window.showInformationMessage(`Deployed ${pluginName} \u2192 ${dest}`, "Open Plugins Folder").then((action) => {
      if (action === "Open Plugins Folder") {
        vscode13.env.openExternal(vscode13.Uri.file(path11.join(projectPath, "Plugins")));
      }
    });
  }
}

// src/commands/addOutputFolder.ts
var vscode14 = __toESM(require("vscode"));
async function addOutputFolderCommand(item, provider) {
  const uris = await vscode14.window.showOpenDialog({
    canSelectFolders: true,
    canSelectFiles: false,
    canSelectMany: false,
    title: "Select output folder for this plugin"
  });
  if (!uris || uris.length === 0) return;
  await addOutputFolder(item.entry.id, uris[0].fsPath);
  provider.refresh();
}

// src/commands/removeOutputFolder.ts
var vscode15 = __toESM(require("vscode"));
async function removeOutputFolderCommand(item, provider) {
  const confirm = await vscode15.window.showWarningMessage(
    `Remove output folder "${item.label}"?`,
    { modal: true },
    "Remove"
  );
  if (confirm !== "Remove") return;
  await removeOutputFolder(item.pluginId, item.folderPath);
  provider.refresh();
}

// src/commands/setPluginUEVersion.ts
var vscode16 = __toESM(require("vscode"));
async function setPluginUEVersionCommand(item, provider) {
  const versions = getUEVersions();
  if (versions.length === 0) {
    vscode16.window.showWarningMessage(
      'No UE versions registered. Use "Discover UE Versions" or add one manually.'
    );
    return;
  }
  const pick = await vscode16.window.showQuickPick(
    versions.map((v) => ({ label: v.name, description: v.installPath, id: v.id })),
    { title: "Select default UE version for this plugin" }
  );
  if (!pick) return;
  const pluginId = "entry" in item ? item.entry.id : item.pluginId;
  await setPluginUEVersion(pluginId, pick.id);
  provider.refresh();
}

// src/commands/clearPluginUEVersion.ts
async function clearPluginUEVersionCommand(item, provider) {
  await clearPluginUEVersion(item.pluginId);
  provider.refresh();
}

// src/commands/cleanBuildOutput.ts
var vscode17 = __toESM(require("vscode"));
var path12 = __toESM(require("path"));
async function cleanBuildOutputCommand(item) {
  const confirm = await vscode17.window.showWarningMessage(
    `Strip Source/, Intermediate/, and .pdb files from "${path12.basename(item.folderPath)}"?`,
    { modal: true },
    "Clean"
  );
  if (confirm !== "Clean") return;
  const result = await cleanBuildOutput(item.folderPath);
  vscode17.window.showInformationMessage(
    `Cleaned: ${[
      result.removedSource && "Source/",
      result.removedIntermediate && "Intermediate/",
      result.pdbCount > 0 && `${result.pdbCount} .pdb file(s)`
    ].filter(Boolean).join(", ") || "nothing to remove"}`
  );
}
async function packageReleaseCommand(item) {
  const versions = getUEVersions();
  const plugin = getPlugins().find((p) => p.id === item.pluginId);
  const pluginName = await vscode17.window.showInputBox({
    prompt: "Plugin name (used in the zip filename)",
    value: plugin?.name ?? path12.basename(item.folderPath),
    validateInput: (v) => v.trim() ? null : "Plugin name cannot be empty"
  });
  if (!pluginName) return;
  const resolvedVersion = plugin?.defaultUEVersionId ? versions.find((v) => v.id === plugin.defaultUEVersionId) : void 0;
  const ueVersion = await vscode17.window.showInputBox({
    prompt: "UE version (e.g. 5.4)",
    value: resolvedVersion?.version ?? "",
    validateInput: (v) => v.trim() ? null : "UE version cannot be empty"
  });
  if (!ueVersion) return;
  const appVersion = await vscode17.window.showInputBox({
    prompt: "Release version (e.g. 1.0.0)",
    placeHolder: "1.0.0",
    validateInput: (v) => v.trim() ? null : "Version cannot be empty"
  });
  if (!appVersion) return;
  try {
    const zipPath = await packageRelease(item.folderPath, pluginName.trim(), ueVersion.trim(), appVersion.trim());
    const open = await vscode17.window.showInformationMessage(
      `Packaged: ${path12.basename(zipPath)}`,
      "Open Folder"
    );
    if (open === "Open Folder") {
      vscode17.env.openExternal(vscode17.Uri.file(path12.dirname(zipPath)));
    }
  } catch (err) {
    vscode17.window.showErrorMessage(`Packaging failed: ${err.message}`);
  }
}

// src/commands/linkPluginToProject.ts
var vscode18 = __toESM(require("vscode"));
var fs10 = __toESM(require("fs"));
var path13 = __toESM(require("path"));
async function linkPluginToProjectCommand(item) {
  let pluginName;
  let pluginPath;
  if (item) {
    pluginName = item.entry.name;
    pluginPath = item.entry.path;
  } else {
    const plugins = getPlugins();
    if (plugins.length === 0) {
      vscode18.window.showWarningMessage("No plugins registered. Add one via the Plugins sidebar.");
      return;
    }
    const pick = await vscode18.window.showQuickPick(
      plugins.map((p) => ({ label: p.name, description: p.path, pluginPath: p.path, name: p.name })),
      { title: "Select plugin to link" }
    );
    if (!pick) return;
    pluginName = pick.name;
    pluginPath = pick.pluginPath;
  }
  const projectPath = await pickProject();
  if (!projectPath) return;
  const pluginsDir = path13.join(projectPath, "Plugins");
  const dest = path13.join(pluginsDir, pluginName);
  if (fs10.existsSync(dest)) {
    const confirm = await vscode18.window.showWarningMessage(
      `"${dest}" already exists. Remove it and create a junction?`,
      { modal: true },
      "Replace"
    );
    if (confirm !== "Replace") return;
    try {
      fs10.rmSync(dest, { recursive: true, force: true });
    } catch (err) {
      vscode18.window.showErrorMessage(`Could not remove existing folder: ${err.message}`);
      return;
    }
  }
  try {
    fs10.mkdirSync(pluginsDir, { recursive: true });
  } catch {
  }
  try {
    fs10.symlinkSync(pluginPath, dest, "junction");
    vscode18.window.showInformationMessage(`Linked: ${dest} \u2192 ${pluginPath}`);
  } catch (err) {
    vscode18.window.showErrorMessage(`Failed to create junction: ${err.message}`);
  }
}

// src/commands/launchUEProject.ts
var vscode20 = __toESM(require("vscode"));
var path14 = __toESM(require("path"));
var cp3 = __toESM(require("child_process"));

// src/services/engineResolver.ts
var vscode19 = __toESM(require("vscode"));
async function resolveEngineInstallPath(pluginId) {
  const versions = getUEVersions();
  if (versions.length === 0) {
    vscode19.window.showWarningMessage(
      'No UE versions registered. Use "Discover UE Versions" or add one manually.'
    );
    return void 0;
  }
  const plugin = getPlugins().find((p) => p.id === pluginId);
  const defaultVersion = plugin?.defaultUEVersionId ? versions.find((v) => v.id === plugin.defaultUEVersionId) : void 0;
  if (defaultVersion) return defaultVersion.installPath;
  const pick = await vscode19.window.showQuickPick(
    versions.map((v) => ({ label: v.name, description: v.installPath, installPath: v.installPath })),
    { title: "Select UE version" }
  );
  return pick?.installPath;
}

// src/commands/launchUEProject.ts
async function launchUEProjectCommand(item) {
  const uprojectPath = item.uprojectPath;
  const installPath = await resolveEngineInstallPath(item.pluginId);
  if (!installPath) return;
  const editorExe = path14.join(installPath, "Engine", "Binaries", "Win64", "UnrealEditor.exe");
  cp3.spawn(`"${editorExe}"`, [`"${uprojectPath}"`], { shell: true, detached: true, stdio: "ignore" }).unref();
  vscode20.window.showInformationMessage(`Launching: ${path14.basename(uprojectPath)}`);
}

// src/commands/generateVSProjectFiles.ts
var vscode21 = __toESM(require("vscode"));
var path15 = __toESM(require("path"));
var cp4 = __toESM(require("child_process"));
async function generateVSProjectFilesCommand(item) {
  const uprojectPath = item.uprojectPath;
  const installPath = await resolveEngineInstallPath(item.pluginId);
  if (!installPath) return;
  const bat = path15.join(installPath, "Engine", "Build", "BatchFiles", "GenerateProjectFiles.bat");
  const args = [`-project="${uprojectPath}"`, "-game"];
  const channel = getChannel();
  channel.clear();
  channel.show(true);
  channel.appendLine(`Generating VS project files for: ${path15.basename(uprojectPath)}`);
  channel.appendLine("\u2500".repeat(60));
  await vscode21.window.withProgress(
    { location: vscode21.ProgressLocation.Notification, title: "Generating VS project files\u2026", cancellable: false },
    () => new Promise((resolve) => {
      const proc = cp4.spawn(`"${bat}"`, args, { shell: true });
      proc.stdout?.on("data", (d) => channel.append(d.toString()));
      proc.stderr?.on("data", (d) => channel.append(d.toString()));
      proc.on("close", (code) => {
        channel.appendLine("\u2500".repeat(60));
        channel.appendLine(code === 0 ? "[Done]" : `[Failed \u2014 exit code ${code}]`);
        if (code !== 0) {
          vscode21.window.showErrorMessage("Generate project files failed. See UE Plugin Tools output.");
        }
        resolve();
      });
      proc.on("error", (err) => {
        channel.appendLine(`[Error: ${err.message}]`);
        vscode21.window.showErrorMessage(`Generate project files error: ${err.message}`);
        resolve();
      });
    })
  );
}

// src/commands/rebuildProject.ts
var vscode22 = __toESM(require("vscode"));
var path16 = __toESM(require("path"));
var cp5 = __toESM(require("child_process"));
async function rebuildProjectCommand(item) {
  const uprojectPath = item.uprojectPath;
  const installPath = await resolveEngineInstallPath(item.pluginId);
  if (!installPath) return;
  const projectName = path16.basename(uprojectPath, ".uproject");
  const bat = path16.join(installPath, "Engine", "Build", "BatchFiles", "Build.bat");
  const args = [`${projectName}Editor`, "Win64", "Development", `"${uprojectPath}"`, "-WaitMutex"];
  const channel = getChannel();
  channel.clear();
  channel.show(true);
  channel.appendLine(`Building: ${projectName}Editor (Win64 Development)`);
  channel.appendLine("\u2500".repeat(60));
  await vscode22.window.withProgress(
    { location: vscode22.ProgressLocation.Notification, title: `Building ${projectName}\u2026`, cancellable: false },
    () => new Promise((resolve) => {
      const proc = cp5.spawn(`"${bat}"`, args, { shell: true });
      proc.stdout?.on("data", (d) => channel.append(d.toString()));
      proc.stderr?.on("data", (d) => channel.append(d.toString()));
      proc.on("close", (code) => {
        channel.appendLine("\u2500".repeat(60));
        if (code === 0) {
          channel.appendLine("[Build succeeded]");
          vscode22.window.showInformationMessage(`Build succeeded: ${projectName}`);
        } else {
          channel.appendLine(`[Build failed \u2014 exit code ${code}]`);
          vscode22.window.showErrorMessage(`Build failed (exit ${code}). See UE Plugin Tools output.`);
        }
        resolve();
      });
      proc.on("error", (err) => {
        channel.appendLine(`[Error: ${err.message}]`);
        vscode22.window.showErrorMessage(`Build error: ${err.message}`);
        resolve();
      });
    })
  );
}

// src/extension.ts
function activate(context) {
  const pluginsProvider = new PluginsProvider();
  const ueVersionsProvider = new UEVersionsProvider();
  vscode23.window.registerTreeDataProvider("uePluginTools.pluginsView", pluginsProvider);
  vscode23.window.registerTreeDataProvider("uePluginTools.ueVersionsView", ueVersionsProvider);
  context.subscriptions.push(
    vscode23.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("uePluginTools.plugins")) pluginsProvider.refresh();
      if (e.affectsConfiguration("uePluginTools.ueVersions")) ueVersionsProvider.refresh();
    })
  );
  context.subscriptions.push(
    vscode23.commands.registerCommand(
      "ue-plugin-tools.addPlugin",
      () => addPluginCommand(pluginsProvider)
    ),
    vscode23.commands.registerCommand(
      "ue-plugin-tools.removePlugin",
      (item) => removePluginCommand(item, pluginsProvider)
    ),
    vscode23.commands.registerCommand(
      "ue-plugin-tools.addUEVersion",
      () => addUEVersionCommand(ueVersionsProvider)
    ),
    vscode23.commands.registerCommand(
      "ue-plugin-tools.removeUEVersion",
      (item) => removeUEVersionCommand(item, ueVersionsProvider)
    ),
    vscode23.commands.registerCommand(
      "ue-plugin-tools.discoverUEVersions",
      () => discoverUEVersionsCommand(ueVersionsProvider)
    ),
    vscode23.commands.registerCommand(
      "ue-plugin-tools.copyPluginToProject",
      (item) => copyPluginToProjectCommand(item)
    ),
    vscode23.commands.registerCommand(
      "ue-plugin-tools.buildPlugin",
      (item) => buildPluginCommand(item)
    ),
    vscode23.commands.registerCommand(
      "ue-plugin-tools.deployRelease",
      () => deployReleaseCommand()
    ),
    vscode23.commands.registerCommand("ue-plugin-tools.copyAndBuild", async (item) => {
      const destPath = await copyPluginToProjectCommand(item);
      if (destPath) {
        await buildPluginCommand(item);
      }
    }),
    vscode23.commands.registerCommand(
      "ue-plugin-tools.addOutputFolder",
      (item) => addOutputFolderCommand(item, pluginsProvider)
    ),
    vscode23.commands.registerCommand(
      "ue-plugin-tools.removeOutputFolder",
      (item) => removeOutputFolderCommand(item, pluginsProvider)
    ),
    vscode23.commands.registerCommand("ue-plugin-tools.openOutputFolder", (item) => {
      vscode23.env.openExternal(vscode23.Uri.file(item.folderPath));
    }),
    vscode23.commands.registerCommand("ue-plugin-tools.refreshUEVersions", () => {
      ueVersionsProvider.refresh();
    }),
    vscode23.commands.registerCommand(
      "ue-plugin-tools.setPluginUEVersion",
      (item) => setPluginUEVersionCommand(item, pluginsProvider)
    ),
    vscode23.commands.registerCommand(
      "ue-plugin-tools.clearPluginUEVersion",
      (item) => clearPluginUEVersionCommand(item, pluginsProvider)
    ),
    vscode23.commands.registerCommand(
      "ue-plugin-tools.cleanBuildOutput",
      (item) => cleanBuildOutputCommand(item)
    ),
    vscode23.commands.registerCommand(
      "ue-plugin-tools.packageRelease",
      (item) => packageReleaseCommand(item)
    ),
    vscode23.commands.registerCommand(
      "ue-plugin-tools.launchUEProject",
      (item) => launchUEProjectCommand(item)
    ),
    vscode23.commands.registerCommand(
      "ue-plugin-tools.generateVSProjectFiles",
      (item) => generateVSProjectFilesCommand(item)
    ),
    vscode23.commands.registerCommand(
      "ue-plugin-tools.rebuildProject",
      (item) => rebuildProjectCommand(item)
    ),
    vscode23.commands.registerCommand(
      "ue-plugin-tools.linkPluginToProject",
      (item) => linkPluginToProjectCommand(item)
    )
  );
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
