import { clearPluginUEVersion } from '../config';
import type { PluginUEVersionItem } from '../providers/pluginsProvider';
import type { PluginsProvider } from '../providers/pluginsProvider';

export async function clearPluginUEVersionCommand(
  item: PluginUEVersionItem,
  provider: PluginsProvider
): Promise<void> {
  await clearPluginUEVersion(item.pluginId);
  provider.refresh();
}
