import type { BirthdayPerson } from "./excelParser";
import { getAllImages, setImage } from "./imageStorage";

export interface ProjectData {
  version: 1;
  month: number;
  people: BirthdayPerson[];
  images: Record<string, string>; // sub-key (e.g. "0", "1") -> serialized photocard state
  customBg: string | null;
}

/**
 * Exports current project state (people, images, bg) as a downloadable JSON file.
 */
export async function exportProject(month: number, people: BirthdayPerson[]): Promise<void> {
  const prefix = `${month}-`;
  const images = await getAllImages(prefix);

  let customBg: string | null = null;
  try { customBg = localStorage.getItem(`bg-custom-${month}`); } catch { /* */ }

  const data: ProjectData = {
    version: 1,
    month,
    people,
    images,
    customBg,
  };

  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `aniversariantes-mes-${month}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Imports a project file and restores images to IndexedDB.
 */
export async function importProject(file: File): Promise<ProjectData> {
  const text = await file.text();
  const data: ProjectData = JSON.parse(text);

  if (data.version !== 1) throw new Error("Versão de arquivo não suportada.");
  if (!data.month || !data.people?.length) throw new Error("Arquivo inválido.");

  for (const [sub, val] of Object.entries(data.images || {})) {
    try { await setImage(`${data.month}-${sub}`, val); } catch { /* */ }
  }

  if (data.customBg) {
    try { localStorage.setItem(`bg-custom-${data.month}`, data.customBg); } catch { /* */ }
  }

  return data;
}
