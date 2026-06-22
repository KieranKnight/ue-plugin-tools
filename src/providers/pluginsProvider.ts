import * as vscode from 'vscode';
import * as path from 'path';
import type { PluginEntry } from '../types';
import { getPlugins, getUEVersions } from '../config';
import { findUProject } from '../services/uprojectFinder';

export class PluginItem extends vscode.TreeItem {
  constructor(public readonly entry: PluginEntry) {
    super(entry.name, vscode.TreeItemCollapsibleState.Collapsed);
    this.description = entry.path;
    this.tooltip = entry.path;
    this.contextValue = 'plugin';
    this.iconPath = new vscode.ThemeIcon('package');
  }
}

export class PluginUEVersionItem extends vscode.TreeItem {
  constructor(
    public readonly pluginId: string,
    ueVersionName?: string,
    ueVersionInstallPath?: string
  ) {
    const isSet = !!ueVersionName;
    super(isSet ? ueVersionName! : 'No default UE version', vscode.TreeItemCollapsibleState.None);
    this.description = isSet ? ueVersionInstallPath : 'right-click plugin to set';
    this.tooltip = isSet ? ueVersionInstallPath : 'No default UE version set';
    this.contextValue = isSet ? 'pluginUEVersion' : 'noPluginUEVersion';
    this.iconPath = new vscode.ThemeIcon(isSet ? 'versions' : 'circle-slash');
  }
}

export class OutputFolderItem extends vscode.TreeItem {
  constructor(
    public readonly folderPath: string,
    public readonly pluginId: string,
    public readonly uprojectPath?: string
  ) {
    super(path.basename(folderPath), vscode.TreeItemCollapsibleState.None);
    this.description = folderPath;
    this.tooltip = folderPath;
    this.contextValue = uprojectPath ? 'outputFolderWithProject' : 'outputFolder';
    this.iconPath = new vscode.ThemeIcon(uprojectPath ? 'root-folder' : 'folder');
  }
}

export class PluginsProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): vscode.TreeItem[] {
    if (!element) {
      return getPlugins().map(p => new PluginItem(p));
    }

    if (element instanceof PluginItem) {
      const versions = getUEVersions();
      const resolvedVersion = element.entry.defaultUEVersionId
        ? versions.find(v => v.id === element.entry.defaultUEVersionId)
        : undefined;

      const ueVersionItem = new PluginUEVersionItem(
        element.entry.id,
        resolvedVersion?.name,
        resolvedVersion?.installPath
      );

      const folders = element.entry.outputFolders ?? [];
      const folderItems =
        folders.length === 0
          ? [(() => {
              const p = new vscode.TreeItem('No output folders — right-click plugin to add one');
              p.contextValue = 'noOutputFolder';
              return p;
            })()]
          : folders.map(f => new OutputFolderItem(f, element.entry.id, findUProject(f) ?? undefined));

      return [ueVersionItem, ...folderItems];
    }

    return [];
  }
}
