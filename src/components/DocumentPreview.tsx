import type { MonthTheme } from "@/lib/monthThemes";
import type { BirthdayPerson } from "@/lib/excelParser";
import PhotoCard from "@/components/PhotoCard";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";

interface DocumentPreviewProps {
  month: number;
  theme: MonthTheme;
  people: BirthdayPerson[];
  onBack: () => void;
}

const COLS = 7;

const DocumentPreview = ({ month, theme, people, onBack }: DocumentPreviewProps) => {
  const rows = Math.ceil(people.length / COLS);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "hsl(220 14% 92%)" }}>
      {/* Toolbar */}
      <div className="no-print max-w-[210mm] mx-auto mb-4 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="gap-2">

          <ArrowLeft size={16} /> Voltar
        </Button>
        <Button
          onClick={handlePrint}
          className="gap-2 text-white px-6 py-3 rounded-xl text-lg shadow-lg"
          style={{ backgroundColor: theme.primaryColor }}>

          <Printer size={20} /> Finalizar e Imprimir
        </Button>
      </div>

      {/* A4 Page */}
      <div className="a4-page print-page mx-auto p-6" style={{ background: theme.bgGradient }}>
        {/* Decorative corners */}
        
        <div className="absolute top-3 right-4 text-2xl opacity-70 select-none">{theme.decorEmoji[1]}</div>
        
        <div className="absolute top-10 right-10 text-lg opacity-40 select-none">{theme.decorEmoji[3]}</div>

        {/* Header */}
        <div className="text-center mb-4 pt-2">
          









          











          <div
            className="text-xs mt-1 font-semibold tracking-wide"
            style={{ color: theme.accentColor }}>

            {theme.campaign} {theme.decorEmoji[0]}
          </div>
        </div>

        {/* Photo Grid */}
        <div className="flex-1">
          {Array.from({ length: rows }).map((_, rowIndex) =>
          <div
            key={rowIndex}
            className="flex justify-center gap-2 mb-3">

              {people.slice(rowIndex * COLS, (rowIndex + 1) * COLS).map((person, colIndex) =>
            <PhotoCard
              key={`${rowIndex}-${colIndex}`}
              dia={person.dia}
              nome={person.nome}
              borderColor={theme.cardBorder}
              textColor={theme.textColor}
              accentColor={theme.accentColor} />

            )}
            </div>
          )}
        </div>

        {/* Footer */}
        















      </div>
    </div>);

};

export default DocumentPreview;