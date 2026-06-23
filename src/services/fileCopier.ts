import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function copyDir(src: string, dest: string, label: string): Promise<boolean> {
  return vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: label, cancellable: false },
    async () => {
      try {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        await fs.promises.cp(src, dest, { recursive: true, force: true });
        return true;
      } catch (err: any) {
        vscode.window.showErrorMessage(`UE Plugin Tools: Copy failed — ${err.message}`);
        return false;
      }
    }
  );
}
