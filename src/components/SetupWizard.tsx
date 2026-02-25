import { useState, useRef } from "react";
import { monthThemes, type MonthTheme } from "@/lib/monthThemes";
import { parseExcelFile, type BirthdayPerson } from "@/lib/excelParser";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Upload, FileSpreadsheet, PartyPopper, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WizardProps {
  onComplete: (month: number, theme: MonthTheme, people: BirthdayPerson[]) => void;
}

const SetupWizard = ({ onComplete }: WizardProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [count, setCount] = useState<number>(0);
  const [people, setPeople] = useState<BirthdayPerson[]>([]);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setError("");
    try {
      const parsed = await parseExcelFile(file);
      if (parsed.length === 0) {
        setError("Nenhum dado encontrado. A planilha precisa ter colunas 'Dia' e 'Nome'.");
        return;
      }
      setPeople(parsed.slice(0, count));
      setStep(4);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao processar a planilha.");
    }
  };

  const months = Object.entries(monthThemes).map(([key, theme]) => ({
    num: Number(key),
    ...theme,
  }));

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, hsl(199 78% 95%), hsl(199 78% 90%))" }}>
      <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full p-8 space-y-6">
        {/* Home button */}
        <div className="flex justify-start mb-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/")} className="gap-2">
            <Home size={16} /> Início
          </Button>
        </div>
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className="h-2 rounded-full flex-1 transition-all duration-300"
              style={{
                backgroundColor: s <= step
                  ? selectedMonth ? monthThemes[selectedMonth].primaryColor : "hsl(199 78% 45%)"
                  : "hsl(220 14% 86%)",
              }}
            />
          ))}
        </div>

        {/* Step 1: Month */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl text-center" style={{ fontFamily: "var(--font-display)", color: "hsl(220 20% 15%)" }}>
              🎂 Selecione o Mês
            </h2>
            <p className="text-center text-muted-foreground text-sm">Qual mês dos aniversariantes?</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {months.map((m) => (
                <button
                  key={m.num}
                  onClick={() => {
                    setSelectedMonth(m.num);
                    setStep(2);
                  }}
                  className="p-3 rounded-xl border-2 text-center transition-all hover:scale-105 hover:shadow-lg"
                  style={{
                    borderColor: selectedMonth === m.num ? m.primaryColor : "transparent",
                    background: selectedMonth === m.num ? m.bgGradient : "hsl(0 0% 97%)",
                  }}
                >
                  <span className="text-xl">{m.decorEmoji[0]}</span>
                  <div className="text-xs font-bold mt-1" style={{ color: m.primaryColor }}>{m.name}</div>
                  <div className="text-muted-foreground" style={{ fontSize: "7px" }}>{m.campaign}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Count */}
        {step === 2 && selectedMonth && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl" style={{ fontFamily: "var(--font-display)", color: monthThemes[selectedMonth].primaryColor }}>
              {monthThemes[selectedMonth].decorEmoji[0]} {monthThemes[selectedMonth].name}
            </h2>
            <p className="text-muted-foreground">Quantos aniversariantes neste mês?</p>
            <input
              type="number"
              min={1}
              max={50}
              value={count || ""}
              onChange={(e) => setCount(Number(e.target.value))}
              placeholder="Ex: 10"
              className="text-center text-3xl font-bold border-2 rounded-xl p-4 w-40 mx-auto block focus:outline-none focus:ring-2"
              style={{
                borderColor: monthThemes[selectedMonth].primaryColor,
                color: monthThemes[selectedMonth].primaryColor,
              }}
            />
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="gap-2 px-6 py-3 rounded-xl text-lg"
              >
                <ChevronLeft size={18} /> Voltar
              </Button>
              <Button
                onClick={() => count > 0 && setStep(3)}
                disabled={!count || count <= 0}
                className="gap-2 text-white px-8 py-3 rounded-xl text-lg"
                style={{ backgroundColor: monthThemes[selectedMonth].primaryColor }}
              >
                Próximo <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Excel upload */}
        {step === 3 && selectedMonth && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl" style={{ fontFamily: "var(--font-display)", color: monthThemes[selectedMonth].primaryColor }}>
              <FileSpreadsheet className="inline mr-2" size={28} />
              Importar Planilha
            </h2>
            <p className="text-muted-foreground text-sm">
              Envie uma planilha Excel (.xlsx) com as colunas <strong>"Dia"</strong>, <strong>"Nome"</strong> e <strong>"Setor"</strong>
            </p>
            <div
              className="border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all hover:shadow-lg"
              style={{ borderColor: monthThemes[selectedMonth].primaryColor }}
              onClick={() => fileRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleFileUpload(file);
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <Upload size={40} className="mx-auto mb-3" style={{ color: monthThemes[selectedMonth].primaryColor }} />
              <p className="font-semibold" style={{ color: monthThemes[selectedMonth].primaryColor }}>
                Clique ou arraste a planilha aqui
              </p>
              <p className="text-xs text-muted-foreground mt-1">.xlsx, .xls</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              className="gap-2 px-6 py-3 rounded-xl text-lg"
            >
              <ChevronLeft size={18} /> Voltar
            </Button>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && selectedMonth && (
          <div className="space-y-6 text-center">
            <PartyPopper size={48} className="mx-auto" style={{ color: monthThemes[selectedMonth].primaryColor }} />
            <h2 className="text-2xl" style={{ fontFamily: "var(--font-display)", color: monthThemes[selectedMonth].primaryColor }}>
              Tudo pronto!
            </h2>
            <p className="text-muted-foreground">
              <strong>{people.length}</strong> aniversariantes de <strong>{monthThemes[selectedMonth].name}</strong>
            </p>
            <div className="max-h-40 overflow-y-auto bg-muted rounded-xl p-3 text-sm text-left">
              {people.map((p, i) => (
                 <div key={i} className="flex justify-between py-1 border-b border-border last:border-0">
                   <span className="font-semibold">Dia {p.dia}</span>
                   <span>{p.nome}{p.setor ? ` — ${p.setor}` : ""}</span>
                 </div>
              ))}
            </div>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(3)}
                className="gap-2 px-6 py-3 rounded-xl text-lg"
              >
                <ChevronLeft size={18} /> Voltar
              </Button>
              <Button
                onClick={() => onComplete(selectedMonth, monthThemes[selectedMonth], people)}
                className="gap-2 text-white px-8 py-3 rounded-xl text-lg"
                style={{ backgroundColor: monthThemes[selectedMonth].primaryColor }}
              >
                Gerar Documento <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupWizard;
