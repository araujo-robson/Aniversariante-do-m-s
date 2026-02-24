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

const COLS = 9;

const DocumentPreview = ({ month, theme, people, onBack }: DocumentPreviewProps) => {
  const rows = Math.ceil(people.length / COLS);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "hsl(220 14% 92%)" }}>
      {/* Toolbar */}
      <div className="no-print max-w-[210mm] mx-auto mb-4 flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft size={16} /> Voltar
        </Button>
        <Button
          onClick={handlePrint}
          className="gap-2 text-white px-6 py-3 rounded-xl text-lg shadow-lg"
          style={{ backgroundColor: theme.primaryColor }}
        >
          <Printer size={20} /> Finalizar e Imprimir
        </Button>
      </div>

      {/* A4 Page */}
      <div
        className="a4-page print-page mx-auto flex flex-col"
        style={{
          background: theme.bgGradient,
          padding: "10mm 8mm 8mm 8mm",
        }}
      >
        {/* Decorative corners */}
        <div className="absolute top-2 left-3 text-3xl opacity-60 select-none">{theme.decorEmoji[0]}</div>
        <div className="absolute top-2 right-3 text-3xl opacity-60 select-none">{theme.decorEmoji[1]}</div>
        <div className="absolute top-8 left-8 text-xl opacity-30 select-none">{theme.decorEmoji[2]}</div>
        <div className="absolute top-8 right-8 text-xl opacity-30 select-none">{theme.decorEmoji[3]}</div>
        <div className="absolute bottom-14 left-3 text-2xl opacity-40 select-none">{theme.decorEmoji[0]}</div>
        <div className="absolute bottom-14 right-3 text-2xl opacity-40 select-none">{theme.decorEmoji[1]}</div>

        {/* Header */}
        <div className="text-center mb-3 pt-1">
          <h1
            className="text-2xl tracking-[0.15em] mb-0"
            style={{
              fontFamily: "var(--font-display)",
              color: theme.primaryColor,
              textShadow: `1px 1px 2px ${theme.secondaryColor}40`,
              fontSize: "20px",
            }}
          >
            ANIVERSARIANTES DE
          </h1>
          <h2
            className="tracking-[0.2em] uppercase"
            style={{
              fontFamily: "var(--font-display)",
              background: theme.headerBg,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontSize: "42px",
              lineHeight: "1.1",
            }}
          >
            {theme.name}
          </h2>
          <div
            className="text-xs mt-0.5 font-semibold tracking-wide"
            style={{ color: theme.accentColor, fontSize: "10px" }}
          >
            {theme.campaign} {theme.decorEmoji[0]}
          </div>
        </div>

        {/* Photo Grid */}
        <div className="flex-1 flex flex-col justify-start">
          {Array.from({ length: rows }).map((_, rowIndex) => {
            const rowPeople = people.slice(rowIndex * COLS, (rowIndex + 1) * COLS);
            return (
              <div
                key={rowIndex}
                className="flex justify-center gap-1 mb-1.5"
                style={{ gap: "4px" }}
              >
                {rowPeople.map((person, colIndex) => (
                  <div key={`${rowIndex}-${colIndex}`} style={{ width: `${100 / COLS}%`, maxWidth: "75px" }}>
                    <PhotoCard
                      dia={person.dia}
                      nome={person.nome}
                      borderColor={theme.cardBorder}
                      textColor={theme.textColor}
                      accentColor={theme.accentColor}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-2 flex items-end justify-between">
          <div
            className="tracking-wide"
            style={{
              fontFamily: "var(--font-display)",
              color: theme.primaryColor,
              fontSize: "28px",
            }}
          >
            PARABÉNS!
          </div>
          <img
            src={logo}
            alt="Hospital São Lucas"
            className="h-12 object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;
