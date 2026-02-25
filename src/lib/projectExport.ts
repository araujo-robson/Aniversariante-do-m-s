import type { BirthdayPerson } from "./excelParser";

export interface ProjectData {
  version: 1;
  month: number;
  people: BirthdayPerson[];
  images: Record<string, string>; // storageKey -> dataURL
  customBg: string | null;
}

/**
 * Exports current project state (people, images, bg) as a downloadable JSON file.
 */
export function exportProject(month: number, people: BirthdayPerson[]): void {
  const images: Record<string, string> = {};

  // Collect all stored images for this month
  for (let i = 0; i < people.length; i++) {
    const key = `photo-${month}-${i}`;
    const val = localStorage.getItem(key);
    if (val) images[`${month}-${i}`] = val;
  }

  const customBg = localStorage.getItem(`bg-custom-${month}`) || null;

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
 * Imports a project file and restores images to localStorage.
 * Returns the project data for state restoration.
 */
export async function importProject(file: File): Promise<ProjectData> {
  const text = await file.text();
  const data: ProjectData = JSON.parse(text);

  if (data.version !== 1) throw new Error("Versão de arquivo não suportada.");
  if (!data.month || !data.people?.length) throw new Error("Arquivo inválido.");

  // Restore images to localStorage
  for (const [key, val] of Object.entries(data.images)) {
    try {
      localStorage.setItem(`photo-${key}`, val);
    } catch { /* storage full */ }
  }

  // Restore custom bg
  if (data.customBg) {
    try {
      localStorage.setItem(`bg-custom-${data.month}`, data.customBg);
    } catch { /* storage full */ }
  }

  return data;
}
