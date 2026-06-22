import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getPlugins } from '../config';
import { pickProject } from './copyPluginToProject';
import type { PluginItem } from '../providers/pluginsProvider';

export async function linkPluginToProjectCommand(item?: PluginItem): Promise<void> {
  let pluginName: string;
  let pluginPath: string;

  if (item) {
    pluginName = item.entry.name;
    pluginPath = item.entry.path;
  } else {
    const plugins = getPlugins();
    if (plugins.length === 0) {
      vscode.window.showWarningMessage('No plugins registered. Add one via the Plugins sidebar.');
      return;
    }
    const pick = await vscode.window.showQuickPick(
      plugins.map(p => ({ label: p.name, description: p.path, pluginPath: p.path, name: p.name })),
      { title: 'Select plugin to link' }
    );
    if (!pick) return;
    pluginName = pick.name;
    pluginPath = pick.pluginPath;
  }

  const projectPath = await pickProject();
  if (!projectPath) return;

  const pluginsDir = path.join(projectPath, 'Plugins');
  const dest = path.join(pluginsDir, pluginName);

  // If destination already exists, confirm removal
  if (fs.existsSync(dest)) {
    const confirm = await vscode.window.showWarningMessage(
      `"${dest}" already exists. Remove it and create a junction?`,
      { modal: true },
      'Replace'
    );
    if (confirm !== 'Replace') return;
    try {
      fs.rmSync(dest, { recursive: true, force: true });
    } catch (err) {
      vscode.window.showErrorMessage(`Could not remove existing folder: ${(err as Error).message}`);
      return;
    }
  }

  // Ensure Plugins/ directory exists
  try {
    fs.mkdirSync(pluginsDir, { recursive: true });
  } catch {}

  // Create junction (no admin rights needed on Windows)
  try {
    fs.symlinkSync(pluginPath, dest, 'junction');
    vscode.window.showInformationMessage(`Linked: ${dest} → ${pluginPath}`);
  } catch (err) {
    vscode.window.showErrorMessage(`Failed to create junction: ${(err as Error).message}`);
  }
}
