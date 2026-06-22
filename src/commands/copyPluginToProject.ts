import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getPlugins } from '../config';
import { copyDir } from '../services/fileCopier';
import type { PluginItem } from '../providers/pluginsProvider';

async function pickPlugin(): Promise<{ name: string; pluginPath: string } | undefined> {
  const plugins = getPlugins();
  if (plugins.length === 0) {
    vscode.window.showWarningMessage('No plugins registered. Add one via the Plugins sidebar.');
    return undefined;
  }
  const pick = await vscode.window.showQuickPick(
    plugins.map(p => ({ label: p.name, description: p.path, pluginPath: p.path, name: p.name })),
    { title: 'Select plugin' }
  );
  return pick;
}

export async function pickProject(): Promise<string | undefined> {
  const uris = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    title: 'Select target UE project folder (containing the .uproject file)',
  });
  if (!uris || uris.length === 0) return undefined;

  const projectPath = uris[0].fsPath;
  const hasUproject = fs.readdirSync(projectPath).some(f => f.endsWith('.uproject'));
  if (!hasUproject) {
    vscode.window.showWarningMessage(
      `No .uproject file found in: ${projectPath}. Are you sure this is a UE project folder?`
    );
  }
  return projectPath;
}

export async function copyPluginToProjectCommand(item?: PluginItem): Promise<string | null> {
  let pluginName: string;
  let pluginPath: string;

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

  const dest = path.join(projectPath, 'Plugins', pluginName);
  const ok = await copyDir(pluginPath, dest, `Copying ${pluginName} to project…`);
  if (ok) {
    vscode.window.showInformationMessage(`Copied ${pluginName} → ${dest}`);
    return dest;
  }
  return null;
}
