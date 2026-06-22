import * as vscode from 'vscode';
import { addOutputFolder } from '../config';
import type { PluginItem } from '../providers/pluginsProvider';
import type { PluginsProvider } from '../providers/pluginsProvider';

export async function addOutputFolderCommand(
  item: PluginItem,
  provider: PluginsProvider
): Promise<void> {
  const uris = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    canSelectFiles: false,
    canSelectMany: false,
    title: 'Select output folder for this plugin',
  });
  if (!uris || uris.length === 0) return;
  await addOutputFolder(item.entry.id, uris[0].fsPath);
  provider.refresh();
}
