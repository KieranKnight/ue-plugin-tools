import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { addUEVersion } from '../config';
import { runUATPath } from '../services/ueDiscovery';
import type { UEVersionsProvider } from '../providers/ueVersionsProvider';

export async function addUEVersionCommand(provider: UEVersionsProvider): Promise<void> {
  const uris = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    title: 'Select UE installation folder (e.g. C:\\Program Files\\Epic Games\\UE_5.7)',
  });

  if (!uris || uris.length === 0) return;

  const installPath = uris[0].fsPath;
  const runUAT = runUATPath(installPath);

  if (!fs.existsSync(runUAT)) {
    vscode.window.showErrorMessage(
      `RunUAT.bat not found at ${runUAT}. Is this a valid UE installation?`
    );
    return;
  }

  const folderName = path.basename(installPath);
  const versionMatch = folderName.match(/(\d+\.\d+)/);
  const detectedVersion = versionMatch ? versionMatch[1] : '';

  const version = await vscode.window.showInputBox({
    prompt: 'UE version (e.g. 5.7)',
    value: detectedVersion,
    validateInput: v => (v.trim() ? null : 'Version cannot be empty'),
  });

  if (!version) return;

  await addUEVersion({ name: `UE ${version.trim()}`, version: version.trim(), installPath });
  provider.refresh();
  vscode.window.showInformationMessage(`Added UE ${version}`);
}
