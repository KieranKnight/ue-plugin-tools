import * as vscode from 'vscode';
import { getPlugins, getUEVersions } from '../config';

export async function resolveEngineInstallPath(pluginId: string): Promise<string | undefined> {
  const versions = getUEVersions();
  if (versions.length === 0) {
    vscode.window.showWarningMessage(
      'No UE versions registered. Use "Discover UE Versions" or add one manually.'
    );
    return undefined;
  }

  const plugin = getPlugins().find(p => p.id === pluginId);
  const defaultVersion = plugin?.defaultUEVersionId
    ? versions.find(v => v.id === plugin.defaultUEVersionId)
    : undefined;

  if (defaultVersion) return defaultVersion.installPath;

  const pick = await vscode.window.showQuickPick(
    versions.map(v => ({ label: v.name, description: v.installPath, installPath: v.installPath })),
    { title: 'Select UE version' }
  );
  return pick?.installPath;
}
