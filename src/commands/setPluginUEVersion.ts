import * as vscode from 'vscode';
import { getUEVersions, setPluginUEVersion } from '../config';
import type { PluginItem, PluginUEVersionItem } from '../providers/pluginsProvider';
import type { PluginsProvider } from '../providers/pluginsProvider';

export async function setPluginUEVersionCommand(
  item: PluginItem | PluginUEVersionItem,
  provider: PluginsProvider
): Promise<void> {
  const versions = getUEVersions();
  if (versions.length === 0) {
    vscode.window.showWarningMessage(
      'No UE versions registered. Use "Discover UE Versions" or add one manually.'
    );
    return;
  }

  const pick = await vscode.window.showQuickPick(
    versions.map(v => ({ label: v.name, description: v.installPath, id: v.id })),
    { title: 'Select default UE version for this plugin' }
  );
  if (!pick) return;

  const pluginId = 'entry' in item ? item.entry.id : item.pluginId;
  await setPluginUEVersion(pluginId, pick.id);
  provider.refresh();
}
