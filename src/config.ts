import * as vscode from 'vscode';
import * as crypto from 'crypto';
import type { PluginEntry, UEVersion } from './types';

function cfg() {
  return vscode.workspace.getConfiguration('uePluginTools');
}

export function getPlugins(): PluginEntry[] {
  return cfg().get<PluginEntry[]>('plugins', []);
}

export async function addPlugin(entry: Omit<PluginEntry, 'id'>): Promise<PluginEntry> {
  const plugins = getPlugins();
  const newEntry: PluginEntry = { id: crypto.randomUUID(), ...entry };
  await cfg().update('plugins', [...plugins, newEntry], vscode.ConfigurationTarget.Global);
  return newEntry;
}

export async function removePlugin(id: string): Promise<void> {
  const plugins = getPlugins().filter(p => p.id !== id);
  await cfg().update('plugins', plugins, vscode.ConfigurationTarget.Global);
}

export function getUEVersions(): UEVersion[] {
  return cfg().get<UEVersion[]>('ueVersions', []);
}

export async function addUEVersion(entry: Omit<UEVersion, 'id'>): Promise<UEVersion> {
  const versions = getUEVersions();
  const newEntry: UEVersion = { id: crypto.randomUUID(), ...entry };
  await cfg().update('ueVersions', [...versions, newEntry], vscode.ConfigurationTarget.Global);
  return newEntry;
}

export async function removeUEVersion(id: string): Promise<void> {
  const versions = getUEVersions().filter(v => v.id !== id);
  await cfg().update('ueVersions', versions, vscode.ConfigurationTarget.Global);
}

export async function mergeUEVersions(discovered: Omit<UEVersion, 'id'>[]): Promise<number> {
  const existing = getUEVersions();
  const existingPaths = new Set(existing.map(v => v.installPath.toLowerCase()));
  const toAdd = discovered.filter(d => !existingPaths.has(d.installPath.toLowerCase()));
  const newEntries: UEVersion[] = toAdd.map(d => ({ id: crypto.randomUUID(), ...d }));
  if (newEntries.length > 0) {
    await cfg().update('ueVersions', [...existing, ...newEntries], vscode.ConfigurationTarget.Global);
  }
  return newEntries.length;
}

export async function addOutputFolder(pluginId: string, folderPath: string): Promise<void> {
  const plugins = getPlugins();
  const updated = plugins.map(p => {
    if (p.id !== pluginId) return p;
    const existing = p.outputFolders ?? [];
    if (existing.includes(folderPath)) return p;
    return { ...p, outputFolders: [...existing, folderPath] };
  });
  await cfg().update('plugins', updated, vscode.ConfigurationTarget.Global);
}

export async function removeOutputFolder(pluginId: string, folderPath: string): Promise<void> {
  const plugins = getPlugins();
  const updated = plugins.map(p => {
    if (p.id !== pluginId) return p;
    return { ...p, outputFolders: (p.outputFolders ?? []).filter(f => f !== folderPath) };
  });
  await cfg().update('plugins', updated, vscode.ConfigurationTarget.Global);
}

export function getEpicGamesPath(): string {
  return cfg().get<string>('epicGamesPath', 'C:\\Program Files\\Epic Games');
}
