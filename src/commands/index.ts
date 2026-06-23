import * as vscode from 'vscode';
import type { PluginsProvider, PluginItem, OutputFolderItem, PluginUEVersionItem } from '../providers/pluginsProvider';
import type { UEVersionsProvider, UEVersionItem } from '../providers/ueVersionsProvider';
import { addPluginCommand } from './addPlugin';
import { removePluginCommand } from './removePlugin';
import { addUEVersionCommand } from './addUEVersion';
import { removeUEVersionCommand } from './removeUEVersion';
import { discoverUEVersionsCommand } from './discoverUEVersions';
import { copyPluginToProjectCommand } from './copyPluginToProject';
import { buildPluginCommand } from './buildPlugin';
import { deployReleaseCommand } from './deployRelease';
import { addOutputFolderCommand } from './addOutputFolder';
import { removeOutputFolderCommand } from './removeOutputFolder';
import { setPluginUEVersionCommand } from './setPluginUEVersion';
import { clearPluginUEVersionCommand } from './clearPluginUEVersion';
import { cleanBuildOutputCommand, packageReleaseCommand } from './cleanBuildOutput';
import { linkPluginToProjectCommand } from './linkPluginToProject';
import { launchUEProjectCommand } from './launchUEProject';
import { generateVSProjectFilesCommand } from './generateVSProjectFiles';
import { rebuildProjectCommand } from './rebuildProject';

export function registerCommands(
  context: vscode.ExtensionContext,
  pluginsProvider: PluginsProvider,
  ueVersionsProvider: UEVersionsProvider
): void {
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
    }),

    vscode.commands.registerCommand(
      'ue-plugin-tools.setPluginUEVersion',
      (item: PluginItem | PluginUEVersionItem) => setPluginUEVersionCommand(item, pluginsProvider)
    ),

    vscode.commands.registerCommand(
      'ue-plugin-tools.clearPluginUEVersion',
      (item: PluginUEVersionItem) => clearPluginUEVersionCommand(item, pluginsProvider)
    ),

    vscode.commands.registerCommand(
      'ue-plugin-tools.cleanBuildOutput',
      (item: OutputFolderItem) => cleanBuildOutputCommand(item)
    ),

    vscode.commands.registerCommand(
      'ue-plugin-tools.packageRelease',
      (item: OutputFolderItem) => packageReleaseCommand(item)
    ),

    vscode.commands.registerCommand(
      'ue-plugin-tools.launchUEProject',
      (item: OutputFolderItem) => launchUEProjectCommand(item)
    ),

    vscode.commands.registerCommand(
      'ue-plugin-tools.generateVSProjectFiles',
      (item: OutputFolderItem) => generateVSProjectFilesCommand(item)
    ),

    vscode.commands.registerCommand(
      'ue-plugin-tools.rebuildProject',
      (item: OutputFolderItem) => rebuildProjectCommand(item)
    ),

    vscode.commands.registerCommand(
      'ue-plugin-tools.linkPluginToProject',
      (item?: PluginItem) => linkPluginToProjectCommand(item)
    )
  );
}
