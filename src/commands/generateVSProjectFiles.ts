import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';
import { resolveEngineInstallPath } from '../services/engineResolver';
import { getChannel } from '../services/pluginBuilder';
import type { OutputFolderItem } from '../providers/pluginsProvider';

export async function generateVSProjectFilesCommand(item: OutputFolderItem): Promise<void> {
  const uprojectPath = item.uprojectPath!;
  const installPath = await resolveEngineInstallPath(item.pluginId);
  if (!installPath) return;

  const bat = path.join(installPath, 'Engine', 'Build', 'BatchFiles', 'GenerateProjectFiles.bat');
  const args = [`-project="${uprojectPath}"`, '-game'];

  const channel = getChannel();
  channel.clear();
  channel.show(true);
  channel.appendLine(`Generating VS project files for: ${path.basename(uprojectPath)}`);
  channel.appendLine('─'.repeat(60));

  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: 'Generating VS project files…', cancellable: false },
    () =>
      new Promise<void>(resolve => {
        const proc = cp.spawn(`"${bat}"`, args, { shell: true });
        proc.stdout?.on('data', (d: Buffer) => channel.append(d.toString()));
        proc.stderr?.on('data', (d: Buffer) => channel.append(d.toString()));
        proc.on('close', code => {
          channel.appendLine('─'.repeat(60));
          channel.appendLine(code === 0 ? '[Done]' : `[Failed — exit code ${code}]`);
          if (code !== 0) {
            vscode.window.showErrorMessage('Generate project files failed. See UE Plugin Tools output.');
          }
          resolve();
        });
        proc.on('error', err => {
          channel.appendLine(`[Error: ${err.message}]`);
          vscode.window.showErrorMessage(`Generate project files error: ${err.message}`);
          resolve();
        });
      })
  );
}
