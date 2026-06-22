import * as fs from 'fs';
import * as path from 'path';

export function findUProject(startPath: string, maxLevels = 4): string | null {
  let dir = startPath;
  for (let i = 0; i < maxLevels; i++) {
    try {
      const match = fs.readdirSync(dir).find(f => f.endsWith('.uproject'));
      if (match) return path.join(dir, match);
    } catch {
      // unreadable directory — keep walking up
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}
