export interface PluginEntry {
  id: string;
  name: string;
  path: string;
  outputFolders?: string[];
}

export interface UEVersion {
  id: string;
  name: string;
  version: string;
  installPath: string;
}
