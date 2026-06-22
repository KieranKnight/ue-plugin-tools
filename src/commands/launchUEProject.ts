import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';
import { resolveEngineInstallPath } from '../services/engineResolver';
import type { OutputFolderItem } from '../providers/pluginsProvider';

export async function launchUEProjectCommand(item: OutputFolderItem): Promise<void> {
  const uprojectPath = item.uprojectPath!;
  const installPath = await resolveEngineInstallPath(item.pluginId);
  if (!installPath) return;

  const editorExe = path.join(installPath, 'Engine', 'Binaries', 'Win64', 'UnrealEditor.exe');
  cp.spawn(`"${editorExe}"`, [`"${uprojectPath}"`], { shell: true, detached: true, stdio: 'ignore' }).unref();
  vscode.window.showInformationMessage(`Launching: ${path.basename(uprojectPath)}`);
}
