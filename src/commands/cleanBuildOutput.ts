import * as vscode from 'vscode';
import * as path from 'path';
import { getPlugins, getUEVersions } from '../config';
import { cleanBuildOutput, packageRelease } from '../services/buildCleaner';
import type { OutputFolderItem } from '../providers/pluginsProvider';

export async function cleanBuildOutputCommand(item: OutputFolderItem): Promise<void> {
  const confirm = await vscode.window.showWarningMessage(
    `Strip Source/, Intermediate/, and .pdb files from "${path.basename(item.folderPath)}"?`,
    { modal: true },
    'Clean'
  );
  if (confirm !== 'Clean') return;

  const result = await cleanBuildOutput(item.folderPath);
  vscode.window.showInformationMessage(
    `Cleaned: ${[
      result.removedSource && 'Source/',
      result.removedIntermediate && 'Intermediate/',
      result.pdbCount > 0 && `${result.pdbCount} .pdb file(s)`,
    ]
      .filter(Boolean)
      .join(', ') || 'nothing to remove'}`
  );
}

export async function packageReleaseCommand(item: OutputFolderItem): Promise<void> {
  const versions = getUEVersions();
  const plugin = getPlugins().find(p => p.id === item.pluginId);

  const pluginName = await vscode.window.showInputBox({
    prompt: 'Plugin name (used in the zip filename)',
    value: plugin?.name ?? path.basename(item.folderPath),
    validateInput: v => (v.trim() ? null : 'Plugin name cannot be empty'),
  });
  if (!pluginName) return;

  // Pre-fill UE version from the plugin's default, otherwise blank
  const resolvedVersion = plugin?.defaultUEVersionId
    ? versions.find(v => v.id === plugin.defaultUEVersionId)
    : undefined;

  const ueVersion = await vscode.window.showInputBox({
    prompt: 'UE version (e.g. 5.4)',
    value: resolvedVersion?.version ?? '',
    validateInput: v => (v.trim() ? null : 'UE version cannot be empty'),
  });
  if (!ueVersion) return;

  const appVersion = await vscode.window.showInputBox({
    prompt: 'Release version (e.g. 1.0.0)',
    placeHolder: '1.0.0',
    validateInput: v => (v.trim() ? null : 'Version cannot be empty'),
  });
  if (!appVersion) return;

  try {
    const zipPath = await packageRelease(item.folderPath, pluginName.trim(), ueVersion.trim(), appVersion.trim());
    const open = await vscode.window.showInformationMessage(
      `Packaged: ${path.basename(zipPath)}`,
      'Open Folder'
    );
    if (open === 'Open Folder') {
      vscode.env.openExternal(vscode.Uri.file(path.dirname(zipPath)));
    }
  } catch (err) {
    vscode.window.showErrorMessage(`Packaging failed: ${(err as Error).message}`);
  }
}
