import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { copyDir } from '../services/fileCopier';

export async function deployReleaseCommand(): Promise<void> {
  const sourceUris = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    title: 'Select built plugin folder (distributable artifacts)',
  });
  if (!sourceUris || sourceUris.length === 0) return;

  const sourcePath = sourceUris[0].fsPath;
  const pluginName = path.basename(sourcePath);

  const projectUris = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    title: 'Select target UE project folder',
  });
  if (!projectUris || projectUris.length === 0) return;

  const projectPath = projectUris[0].fsPath;
  const hasUproject = fs.readdirSync(projectPath).some(f => f.endsWith('.uproject'));
  if (!hasUproject) {
    vscode.window.showWarningMessage(
      `No .uproject found in: ${projectPath}. Are you sure this is a UE project folder?`
    );
  }

  const dest = path.join(projectPath, 'Plugins', pluginName);
  const ok = await copyDir(sourcePath, dest, `Deploying ${pluginName} to project…`);
  if (ok) {
    vscode.window
      .showInformationMessage(`Deployed ${pluginName} → ${dest}`, 'Open Plugins Folder')
      .then(action => {
        if (action === 'Open Plugins Folder') {
          vscode.env.openExternal(vscode.Uri.file(path.join(projectPath, 'Plugins')));
        }
      });
  }
}
