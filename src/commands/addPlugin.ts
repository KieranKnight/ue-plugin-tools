import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { addPlugin } from '../config';
import type { PluginsProvider } from '../providers/pluginsProvider';

export async function addPluginCommand(provider: PluginsProvider): Promise<void> {
  const uris = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    title: 'Select plugin folder (containing the .uplugin file)',
  });

  if (!uris || uris.length === 0) return;

  const pluginPath = uris[0].fsPath;
  let upluginName: string | undefined;

  try {
    const files = fs.readdirSync(pluginPath).filter(f => f.endsWith('.uplugin'));
    if (files.length === 0) {
      vscode.window.showErrorMessage(`No .uplugin file found in: ${pluginPath}`);
      return;
    }
    upluginName = path.basename(files[0], '.uplugin');
  } catch (err: any) {
    vscode.window.showErrorMessage(`UE Plugin Tools: ${err.message}`);
    return;
  }

  const name = await vscode.window.showInputBox({
    prompt: 'Plugin name',
    value: upluginName,
    validateInput: v => (v.trim() ? null : 'Name cannot be empty'),
  });

  if (!name) return;

  await addPlugin({ name: name.trim(), path: pluginPath });
  provider.refresh();
  vscode.window.showInformationMessage(`Added plugin: ${name}`);
}
