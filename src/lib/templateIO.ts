import type { ContourParams } from '@/lib/noise';
import type { LabelStyleParams } from '@/components/LabelControls';

export interface SavedTemplate {
  version: 1;
  name: string;
  createdAt: string;
  seed: number;
  themeId: string;
  terrainId: string;
  contourParams: ContourParams;
  labelMode: 'number' | 'abbrev' | 'full';
  labelStyle: LabelStyleParams;
  canvasPresetId: string;
}

const STORAGE_KEY = 'outland.templates.v1';

export function loadTemplates(): SavedTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTemplates(templates: SavedTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function addTemplate(template: SavedTemplate) {
  const list = loadTemplates();
  list.push(template);
  saveTemplates(list);
  return list;
}

export function deleteTemplate(name: string) {
  const list = loadTemplates().filter(t => t.name !== name);
  saveTemplates(list);
  return list;
}

export function exportTemplateToFile(template: SavedTemplate) {
  const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${template.name.replace(/[^a-z0-9-_]/gi, '_')}.outland.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importTemplateFromFile(file: File): Promise<SavedTemplate> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || parsed.version !== 1 || !parsed.contourParams) {
          throw new Error('Invalid template file');
        }
        resolve(parsed as SavedTemplate);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
