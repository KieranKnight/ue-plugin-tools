import * as vscode from 'vscode';
import { removeUEVersion } from '../config';
import type { UEVersionItem, UEVersionsProvider } from '../providers/ueVersionsProvider';

export async function removeUEVersionCommand(
  item: UEVersionItem | undefined,
  provider: UEVersionsProvider
): Promise<void> {
  if (!item) return;

  const confirm = await vscode.window.showWarningMessage(
    `Remove "${item.entry.name}" from the UE versions list?`,
    { modal: true },
    'Remove'
  );
  if (confirm !== 'Remove') return;

  await removeUEVersion(item.entry.id);
  provider.refresh();
}
