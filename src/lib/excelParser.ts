import readXlsxFile from "read-excel-file/browser";

export interface BirthdayPerson {
  dia: string;
  nome: string;
  setor: string;
  image?: string;
}

export async function parseExcelFile(file: File): Promise<BirthdayPerson[]> {
  try {
    const rows = await readXlsxFile(file);

    if (rows.length < 2) {
      return [];
    }

    // Find column indices from header row
    const header = rows[0].map((cell) => String(cell ?? "").trim().toLowerCase());
    const diaIdx = header.findIndex((h) => h === "dia");
    const nomeIdx = header.findIndex((h) => h === "nome");
    const setorIdx = header.findIndex((h) => h === "setor");

    if (nomeIdx === -1) {
      throw new Error("Coluna 'Nome' não encontrada na planilha.");
    }

    const people: BirthdayPerson[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const dia = diaIdx >= 0 ? String(row[diaIdx] ?? "").trim() : "";
      const nome = nomeIdx >= 0 ? String(row[nomeIdx] ?? "").trim() : "";
      const setor = setorIdx >= 0 ? String(row[setorIdx] ?? "").trim() : "";

      if (dia && nome) {
        people.push({ dia, nome, setor });
      }
    }

    return people;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Erro ao ler a planilha. Verifique o formato.");
  }
}
