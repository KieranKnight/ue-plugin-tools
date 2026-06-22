import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';

export interface CleanResult {
  removedSource: boolean;
  removedIntermediate: boolean;
  pdbCount: number;
}

export async function cleanBuildOutput(outputPath: string): Promise<CleanResult> {
  const result: CleanResult = { removedSource: false, removedIntermediate: false, pdbCount: 0 };

  const sourceDir = path.join(outputPath, 'Source');
  if (fs.existsSync(sourceDir)) {
    try { fs.rmSync(sourceDir, { recursive: true, force: true }); result.removedSource = true; } catch {}
  }

  const intermediateDir = path.join(outputPath, 'Intermediate');
  if (fs.existsSync(intermediateDir)) {
    try { fs.rmSync(intermediateDir, { recursive: true, force: true }); result.removedIntermediate = true; } catch {}
  }

  const binariesDir = path.join(outputPath, 'Binaries');
  if (fs.existsSync(binariesDir)) {
    result.pdbCount = deletePdbs(binariesDir);
  }

  return result;
}

function deletePdbs(dir: string): number {
  let count = 0;
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        count += deletePdbs(fullPath);
      } else if (entry.name.endsWith('.pdb')) {
        try { fs.unlinkSync(fullPath); count++; } catch {}
      }
    }
  } catch {}
  return count;
}

export function packageRelease(
  outputPath: string,
  pluginName: string,
  ueVersion: string,
  appVersion: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stageDir = path.join(outputPath, pluginName);
    const zipName = `${pluginName}_UE${ueVersion}-${appVersion}.zip`;
    const zipPath = path.join(outputPath, zipName);

    // Move all loose items into the stage subfolder
    try {
      fs.mkdirSync(stageDir, { recursive: true });
      for (const entry of fs.readdirSync(outputPath)) {
        if (entry === pluginName) continue; // skip the stage folder itself
        fs.renameSync(path.join(outputPath, entry), path.join(stageDir, entry));
      }
    } catch (err) {
      return reject(new Error(`Staging failed: ${(err as Error).message}`));
    }

    // Zip the stage folder via PowerShell Compress-Archive
    const script = `Compress-Archive -Path '${stageDir.replace(/'/g, "''")}' -DestinationPath '${zipPath.replace(/'/g, "''")}' -Force`;
    cp.exec(`powershell -NoProfile -Command "${script}"`, err => {
      if (err) {
        return reject(new Error(`Zip failed: ${err.message}`));
      }

      // Remove the stage subfolder — zip only remains
      try { fs.rmSync(stageDir, { recursive: true, force: true }); } catch {}

      resolve(zipPath);
    });
  });
}
