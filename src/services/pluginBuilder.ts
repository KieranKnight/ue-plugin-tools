import * as vscode from 'vscode';
import * as fs from 'fs';
import * as cp from 'child_process';
import * as path from 'path';

let outputChannel: vscode.OutputChannel | undefined;

function getChannel(): vscode.OutputChannel {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel('UE Plugin Tools');
  }
  return outputChannel;
}

function findUplugin(pluginDir: string): string | null {
  try {
    const files = fs.readdirSync(pluginDir).filter(f => f.endsWith('.uplugin'));
    return files.length > 0 ? path.join(pluginDir, files[0]) : null;
  } catch {
    return null;
  }
}

export async function buildPlugin(
  pluginPath: string,
  runUAT: string,
  outputPath: string
): Promise<boolean> {
  const uplugin = findUplugin(pluginPath);
  if (!uplugin) {
    vscode.window.showErrorMessage(`UE Plugin Tools: No .uplugin file found in ${pluginPath}`);
    return false;
  }

  if (!fs.existsSync(runUAT)) {
    vscode.window.showErrorMessage(`UE Plugin Tools: RunUAT.bat not found at ${runUAT}`);
    return false;
  }

  const channel = getChannel();
  channel.clear();
  channel.show(true);
  channel.appendLine(`Building: ${path.basename(uplugin)}`);
  channel.appendLine(`Output:   ${outputPath}`);
  channel.appendLine('─'.repeat(60));

  const args = [
    'BuildPlugin',
    `-Plugin="${uplugin}"`,
    `-Package="${outputPath}"`,
    '-TargetPlatforms=Win64',
  ];

  return vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Building ${path.basename(pluginPath)}…`,
      cancellable: true,
    },
    (_progress, token) =>
      new Promise<boolean>(resolve => {
        const proc = cp.spawn(`"${runUAT}"`, args, { shell: true });

        token.onCancellationRequested(() => {
          proc.kill();
          channel.appendLine('\n[Cancelled by user]');
          resolve(false);
        });

        proc.stdout?.on('data', (data: Buffer) => channel.append(data.toString()));
        proc.stderr?.on('data', (data: Buffer) => channel.append(data.toString()));

        proc.on('close', code => {
          channel.appendLine('─'.repeat(60));
          if (code === 0) {
            channel.appendLine('[Build succeeded]');
            resolve(true);
          } else {
            channel.appendLine(`[Build failed — exit code ${code}]`);
            vscode.window.showErrorMessage(
              `Build failed (exit ${code}). See the UE Plugin Tools output channel for details.`
            );
            resolve(false);
          }
        });

        proc.on('error', err => {
          channel.appendLine(`[Process error: ${err.message}]`);
          vscode.window.showErrorMessage(`UE Plugin Tools: ${err.message}`);
          resolve(false);
        });
      })
  );
}
