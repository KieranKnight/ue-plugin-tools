import * as vscode from 'vscode';
import * as path from 'path';
import { getPlugins, getUEVersions } from '../config';
import { buildPlugin } from '../services/pluginBuilder';
import { cleanBuildOutput, packageRelease } from '../services/buildCleaner';
import { runUATPath } from '../services/ueDiscovery';
import type { PluginItem } from '../providers/pluginsProvider';
import type { UEVersion } from '../types';

export async function buildPluginCommand(item?: PluginItem): Promise<boolean> {
  const plugins = getPlugins();
  const versions = getUEVersions();

  if (versions.length === 0) {
    vscode.window.showWarningMessage(
      'No UE versions registered. Use "Discover UE Versions" or add one manually.'
    );
    return false;
  }

  let pluginName: string;
  let pluginPath: string;
  let defaultUEVersionId: string | undefined;

  if (item) {
    pluginName = item.entry.name;
    pluginPath = item.entry.path;
    defaultUEVersionId = item.entry.defaultUEVersionId;
  } else {
    if (plugins.length === 0) {
      vscode.window.showWarningMessage('No plugins registered. Add one via the Plugins sidebar.');
      return false;
    }
    const pick = await vscode.window.showQuickPick(
      plugins.map(p => ({ label: p.name, description: p.path, pluginPath: p.path, name: p.name, defaultUEVersionId: p.defaultUEVersionId })),
      { title: 'Select plugin to build' }
    );
    if (!pick) return false;
    pluginName = pick.name;
    pluginPath = pick.pluginPath;
    defaultUEVersionId = pick.defaultUEVersionId;
  }

  // Resolve UE version — use default if set, otherwise QuickPick
  let resolvedVersion: UEVersion | undefined;
  if (defaultUEVersionId) {
    resolvedVersion = versions.find(v => v.id === defaultUEVersionId);
  }

  let ueVersionName: string;
  let installPath: string;

  if (resolvedVersion) {
    ueVersionName = resolvedVersion.name;
    installPath = resolvedVersion.installPath;
  } else {
    const versionPick = await vscode.window.showQuickPick(
      versions.map(v => ({ label: v.name, description: v.installPath, installPath: v.installPath, version: v.version })),
      { title: 'Select UE version to build against' }
    );
    if (!versionPick) return false;
    ueVersionName = versionPick.label;
    installPath = versionPick.installPath;
  }

  const defaultOutput = path.join(pluginPath, 'Build', ueVersionName.replace(/\s/g, '_'));
  const outputPath = await vscode.window.showInputBox({
    prompt: 'Output folder for the built plugin',
    value: defaultOutput,
    validateInput: v => (v.trim() ? null : 'Output path cannot be empty'),
  });
  if (!outputPath) return false;

  const success = await buildPlugin(pluginPath, runUATPath(installPath), outputPath.trim());

  if (success) {
    const ueVersionShort = resolvedVersion?.version ?? ueVersionName.replace(/^UE\s*/i, '');
    const action = await vscode.window.showInformationMessage(
      `Build succeeded: ${pluginName} (${ueVersionName})`,
      'Open Output Folder',
      'Clean Output',
      'Clean & Package'
    );
    if (action === 'Open Output Folder') {
      vscode.env.openExternal(vscode.Uri.file(outputPath.trim()));
    } else if (action === 'Clean Output') {
      const result = await cleanBuildOutput(outputPath.trim());
      vscode.window.showInformationMessage(
        `Cleaned: ${[
          result.removedSource && 'Source/',
          result.removedIntermediate && 'Intermediate/',
          result.pdbCount > 0 && `${result.pdbCount} .pdb file(s)`,
        ]
          .filter(Boolean)
          .join(', ') || 'nothing to remove'}`
      );
    } else if (action === 'Clean & Package') {
      await cleanBuildOutput(outputPath.trim());
      const appVersion = await vscode.window.showInputBox({
        prompt: 'Release version (e.g. 1.0.0)',
        placeHolder: '1.0.0',
        validateInput: v => (v.trim() ? null : 'Version cannot be empty'),
      });
      if (!appVersion) return success;
      try {
        const zipPath = await packageRelease(outputPath.trim(), pluginName, ueVersionShort, appVersion.trim());
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
  }

  return success;
}
