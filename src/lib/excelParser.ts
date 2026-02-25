import * as XLSX from "xlsx";

export interface BirthdayPerson {
  dia: string;
  nome: string;
  setor: string;
  image?: string;
}

export function parseExcelFile(file: File): Promise<BirthdayPerson[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

        const people: BirthdayPerson[] = json.map((row) => {
          const dia = String(
            row["Dia"] ?? row["dia"] ?? row["DIA"] ?? ""
          ).trim();
          const nome = String(
            row["Nome"] ?? row["nome"] ?? row["NOME"] ?? ""
          ).trim();
          const setor = String(
            row["Setor"] ?? row["setor"] ?? row["SETOR"] ?? ""
          ).trim();
          return { dia, nome, setor };
        }).filter((p) => p.dia && p.nome);

        resolve(people);
      } catch {
        reject(new Error("Erro ao ler a planilha. Verifique o formato."));
      }
    };
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo."));
    reader.readAsArrayBuffer(file);
  });
}
