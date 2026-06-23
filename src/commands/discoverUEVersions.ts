import * as vscode from 'vscode';
import { getEpicGamesPath, mergeUEVersions } from '../config';
import { discoverUEVersions } from '../services/ueDiscovery';
import type { UEVersionsProvider } from '../providers/ueVersionsProvider';

export async function discoverUEVersionsCommand(provider: UEVersionsProvider): Promise<void> {
  const epicPath = getEpicGamesPath();
  const found = discoverUEVersions(epicPath);

  if (found.length === 0) {
    vscode.window.showWarningMessage(
      `No UE installations found in: ${epicPath}\n\nCheck the uePluginTools.epicGamesPath setting.`
    );
    return;
  }

  const added = await mergeUEVersions(found);
  provider.refresh();

  if (added === 0) {
    vscode.window.showInformationMessage(
      `Found ${found.length} installation(s) — all already registered.`
    );
  } else {
    vscode.window.showInformationMessage(
      `Found ${found.length} installation(s), added ${added} new.`
    );
  }
}
