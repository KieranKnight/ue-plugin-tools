import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';
import { resolveEngineInstallPath } from '../services/engineResolver';
import { getChannel } from '../services/pluginBuilder';
import type { OutputFolderItem } from '../providers/pluginsProvider';

export async function rebuildProjectCommand(item: OutputFolderItem): Promise<void> {
  const uprojectPath = item.uprojectPath!;
  const installPath = await resolveEngineInstallPath(item.pluginId);
  if (!installPath) return;

  const projectName = path.basename(uprojectPath, '.uproject');
  const bat = path.join(installPath, 'Engine', 'Build', 'BatchFiles', 'Build.bat');
  const args = [`${projectName}Editor`, 'Win64', 'Development', `"${uprojectPath}"`, '-WaitMutex'];

  const channel = getChannel();
  channel.clear();
  channel.show(true);
  channel.appendLine(`Building: ${projectName}Editor (Win64 Development)`);
  channel.appendLine('─'.repeat(60));

  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: `Building ${projectName}…`, cancellable: false },
    () =>
      new Promise<void>(resolve => {
        const proc = cp.spawn(`"${bat}"`, args, { shell: true });
        proc.stdout?.on('data', (d: Buffer) => channel.append(d.toString()));
        proc.stderr?.on('data', (d: Buffer) => channel.append(d.toString()));
        proc.on('close', code => {
          channel.appendLine('─'.repeat(60));
          if (code === 0) {
            channel.appendLine('[Build succeeded]');
            vscode.window.showInformationMessage(`Build succeeded: ${projectName}`);
          } else {
            channel.appendLine(`[Build failed — exit code ${code}]`);
            vscode.window.showErrorMessage(`Build failed (exit ${code}). See UE Plugin Tools output.`);
          }
          resolve();
        });
        proc.on('error', err => {
          channel.appendLine(`[Error: ${err.message}]`);
          vscode.window.showErrorMessage(`Build error: ${err.message}`);
          resolve();
        });
      })
  );
}
