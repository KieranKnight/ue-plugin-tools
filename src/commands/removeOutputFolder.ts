import * as vscode from 'vscode';
import { removeOutputFolder } from '../config';
import type { OutputFolderItem } from '../providers/pluginsProvider';
import type { PluginsProvider } from '../providers/pluginsProvider';

export async function removeOutputFolderCommand(
  item: OutputFolderItem,
  provider: PluginsProvider
): Promise<void> {
  const confirm = await vscode.window.showWarningMessage(
    `Remove output folder "${item.label}"?`,
    { modal: true },
    'Remove'
  );
  if (confirm !== 'Remove') return;
  await removeOutputFolder(item.pluginId, item.folderPath);
  provider.refresh();
}
