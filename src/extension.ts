import * as vscode from 'vscode';
import { PluginsProvider } from './providers/pluginsProvider';
import { UEVersionsProvider } from './providers/ueVersionsProvider';
import { registerCommands } from './commands/index';

export function activate(context: vscode.ExtensionContext) {
  const pluginsProvider = new PluginsProvider();
  const ueVersionsProvider = new UEVersionsProvider();

  vscode.window.registerTreeDataProvider('uePluginTools.pluginsView', pluginsProvider);
  vscode.window.registerTreeDataProvider('uePluginTools.ueVersionsView', ueVersionsProvider);

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('uePluginTools.plugins')) pluginsProvider.refresh();
      if (e.affectsConfiguration('uePluginTools.ueVersions')) ueVersionsProvider.refresh();
    })
  );

  registerCommands(context, pluginsProvider, ueVersionsProvider);
}

export function deactivate() {}
