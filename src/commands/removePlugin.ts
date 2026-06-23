import * as vscode from 'vscode';
import { removePlugin } from '../config';
import type { PluginItem, PluginsProvider } from '../providers/pluginsProvider';

export async function removePluginCommand(
  item: PluginItem | undefined,
  provider: PluginsProvider
): Promise<void> {
  if (!item) return;

  const confirm = await vscode.window.showWarningMessage(
    `Remove "${item.entry.name}" from the plugin list?`,
    { modal: true },
    'Remove'
  );
  if (confirm !== 'Remove') return;

  await removePlugin(item.entry.id);
  provider.refresh();
}
