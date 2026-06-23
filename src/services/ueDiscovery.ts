import * as fs from 'fs';
import * as path from 'path';
import type { UEVersion } from '../types';

export function discoverUEVersions(epicGamesPath: string): Omit<UEVersion, 'id'>[] {
  if (!fs.existsSync(epicGamesPath)) {
    return [];
  }

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(epicGamesPath, { withFileTypes: true });
  } catch {
    return [];
  }

  const results: Omit<UEVersion, 'id'>[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const match = entry.name.match(/^UE_(\d+\.\d+)$/);
    if (!match) continue;

    const version = match[1];
    const installPath = path.join(epicGamesPath, entry.name);
    const runUAT = path.join(installPath, 'Engine', 'Build', 'BatchFiles', 'RunUAT.bat');

    if (!fs.existsSync(runUAT)) continue;

    results.push({
      name: `UE ${version}`,
      version,
      installPath,
    });
  }

  results.sort((a, b) => a.version.localeCompare(b.version, undefined, { numeric: true }));
  return results;
}

export function runUATPath(installPath: string): string {
  return path.join(installPath, 'Engine', 'Build', 'BatchFiles', 'RunUAT.bat');
}
