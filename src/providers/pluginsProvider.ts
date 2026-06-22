import * as vscode from 'vscode';
import * as path from 'path';
import type { PluginEntry } from '../types';
import { getPlugins } from '../config';

export class PluginItem extends vscode.TreeItem {
  constructor(public readonly entry: PluginEntry) {
    super(entry.name, vscode.TreeItemCollapsibleState.Collapsed);
    this.description = entry.path;
    this.tooltip = entry.path;
    this.contextValue = 'plugin';
    this.iconPath = new vscode.ThemeIcon('package');
  }
}

export class OutputFolderItem extends vscode.TreeItem {
  constructor(
    public readonly folderPath: string,
    public readonly pluginId: string
  ) {
    super(path.basename(folderPath), vscode.TreeItemCollapsibleState.None);
    this.description = folderPath;
    this.tooltip = folderPath;
    this.contextValue = 'outputFolder';
    this.iconPath = new vscode.ThemeIcon('folder');
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
      const folders = element.entry.outputFolders ?? [];
      if (folders.length === 0) {
        const placeholder = new vscode.TreeItem('No output folders — right-click plugin to add one');
        placeholder.contextValue = 'noOutputFolder';
        return [placeholder];
      }
      return folders.map(f => new OutputFolderItem(f, element.entry.id));
    }

    return [];
  }
}
