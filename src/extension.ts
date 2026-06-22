import * as vscode from 'vscode';
import { PluginsProvider } from './providers/pluginsProvider';
import { UEVersionsProvider } from './providers/ueVersionsProvider';
import type { PluginItem } from './providers/pluginsProvider';
import type { UEVersionItem } from './providers/ueVersionsProvider';
import { addPluginCommand } from './commands/addPlugin';
import { removePluginCommand } from './commands/removePlugin';
import { addUEVersionCommand } from './commands/addUEVersion';
import { removeUEVersionCommand } from './commands/removeUEVersion';
import { discoverUEVersionsCommand } from './commands/discoverUEVersions';
import { copyPluginToProjectCommand } from './commands/copyPluginToProject';
import { buildPluginCommand } from './commands/buildPlugin';
import { deployReleaseCommand } from './commands/deployRelease';
import { addOutputFolderCommand } from './commands/addOutputFolder';
import { removeOutputFolderCommand } from './commands/removeOutputFolder';
import { OutputFolderItem } from './providers/pluginsProvider';

export function activate(context: vscode.ExtensionContext) {
  const pluginsProvider = new PluginsProvider();
  const ueVersionsProvider = new UEVersionsProvider();

  vscode.window.registerTreeDataProvider('uePluginTools.pluginsView', pluginsProvider);
  vscode.window.registerTreeDataProvider('uePluginTools.ueVersionsView', ueVersionsProvider);

  // Refresh tree views when settings change
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('uePluginTools.plugins')) pluginsProvider.refresh();
      if (e.affectsConfiguration('uePluginTools.ueVersions')) ueVersionsProvider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('ue-plugin-tools.addPlugin', () =>
      addPluginCommand(pluginsProvider)
    ),

    vscode.commands.registerCommand('ue-plugin-tools.removePlugin', (item?: PluginItem) =>
      removePluginCommand(item, pluginsProvider)
    ),

    vscode.commands.registerCommand('ue-plugin-tools.addUEVersion', () =>
      addUEVersionCommand(ueVersionsProvider)
    ),

    vscode.commands.registerCommand('ue-plugin-tools.removeUEVersion', (item?: UEVersionItem) =>
      removeUEVersionCommand(item, ueVersionsProvider)
    ),

    vscode.commands.registerCommand('ue-plugin-tools.discoverUEVersions', () =>
      discoverUEVersionsCommand(ueVersionsProvider)
    ),

    vscode.commands.registerCommand('ue-plugin-tools.copyPluginToProject', (item?: PluginItem) =>
      copyPluginToProjectCommand(item)
    ),

    vscode.commands.registerCommand('ue-plugin-tools.buildPlugin', (item?: PluginItem) =>
      buildPluginCommand(item)
    ),

    vscode.commands.registerCommand('ue-plugin-tools.deployRelease', () =>
      deployReleaseCommand()
    ),

    vscode.commands.registerCommand('ue-plugin-tools.copyAndBuild', async (item?: PluginItem) => {
      const destPath = await copyPluginToProjectCommand(item);
      if (destPath) {
        await buildPluginCommand(item);
      }
    }),

    vscode.commands.registerCommand('ue-plugin-tools.addOutputFolder', (item: PluginItem) =>
      addOutputFolderCommand(item, pluginsProvider)
    ),

    vscode.commands.registerCommand('ue-plugin-tools.removeOutputFolder', (item: OutputFolderItem) =>
      removeOutputFolderCommand(item, pluginsProvider)
    ),

    vscode.commands.registerCommand('ue-plugin-tools.openOutputFolder', (item: OutputFolderItem) => {
      vscode.env.openExternal(vscode.Uri.file(item.folderPath));
    }),

    vscode.commands.registerCommand('ue-plugin-tools.refreshUEVersions', () => {
      ueVersionsProvider.refresh();
    })
  );
}

export function deactivate() {}
