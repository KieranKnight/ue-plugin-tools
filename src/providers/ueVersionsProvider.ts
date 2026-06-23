import * as vscode from 'vscode';
import type { UEVersion } from '../types';
import { getUEVersions } from '../config';

export class UEVersionItem extends vscode.TreeItem {
  constructor(public readonly entry: UEVersion) {
    super(entry.name, vscode.TreeItemCollapsibleState.None);
    this.description = entry.installPath;
    this.tooltip = entry.installPath;
    this.contextValue = 'ueVersion';
    this.iconPath = new vscode.ThemeIcon('versions');
  }
}

export class UEVersionsProvider implements vscode.TreeDataProvider<UEVersionItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<UEVersionItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: UEVersionItem): vscode.TreeItem {
    return element;
  }

  getChildren(): UEVersionItem[] {
    return getUEVersions().map(v => new UEVersionItem(v));
  }
}
