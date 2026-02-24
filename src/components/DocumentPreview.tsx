import { useState, useRef } from "react";
import type { MonthTheme } from "@/lib/monthThemes";
import type { BirthdayPerson } from "@/lib/excelParser";
import PhotoCard from "@/components/PhotoCard";
import logo from "@/assets/logo.png";
import fevereiroBg from "@/assets/fevereiro-bg.png";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, ImagePlus } from "lucide-react";

interface DocumentPreviewProps {
  month: number;
  theme: MonthTheme;
  people: BirthdayPerson[];
  onBack: () => void;
}

// Body area dimensions in mm
const BODY_WIDTH = 180;
const BODY_HEIGHT = 200;
const BODY_LEFT = 14;
const BODY_TOP = 62;
const GAP = 2;

const defaultBgImages: Record<string, string> = {
  fevereiro: fevereiroBg,
};

function getMaxCols(count: number): number {
  if (count <= 20) return 5;
  if (count <= 24) return 6;
  return 7;
}

const DocumentPreview = ({ month, theme, people, onBack }: DocumentPreviewProps) => {
  const [customBg, setCustomBg] = useState<string | null>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const maxCols = getMaxCols(people.length);
  const cols = Math.min(maxCols, people.length);
  const rows = Math.ceil(people.length / cols);

  const hasBgImage = !!theme.bgImage;
  const bgImageUrl = customBg || (theme.bgImage ? defaultBgImages[theme.bgImage] : null);

  const handleBgUpload = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setCustomBg(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

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
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => bgInputRef.current?.click()}
            className="gap-2"
          >
            <ImagePlus size={16} /> Alterar Plano de Fundo
          </Button>
          <input
            ref={bgInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleBgUpload(file);
            }}
          />
          <Button
            onClick={handlePrint}
            className="gap-2 text-white px-6 py-3 rounded-xl text-lg shadow-lg"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <Printer size={20} /> Finalizar e Imprimir
          </Button>
        </div>
      </div>

      {/* A4 Page - Landscape */}
      <div
        className="a4-page print-page mx-auto relative"
        style={{
          background: bgImageUrl
            ? `url(${bgImageUrl}) center/cover no-repeat`
            : theme.bgGradient,
        }}
      >
        {/* Decorative corners - hide when bg image */}
        {!hasBgImage && !customBg && (
          <>
            <div className="absolute top-3 right-4 text-2xl opacity-70 select-none">{theme.decorEmoji[1]}</div>
            <div className="absolute top-10 right-10 text-lg opacity-40 select-none">{theme.decorEmoji[3]}</div>
          </>
        )}

        {/* Photo Grid Body - fixed position and dimensions */}
        <div
          style={{
            position: "absolute",
            left: `${BODY_LEFT}mm`,
            top: `${BODY_TOP}mm`,
            width: `${BODY_WIDTH}mm`,
            height: `${BODY_HEIGHT}mm`,
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: `${GAP}mm`,
            alignContent: "start",
          }}
        >
          {people.map((person, index) => (
            <PhotoCard
              key={index}
              dia={person.dia}
              nome={person.nome}
              borderColor={theme.cardBorder}
              textColor={theme.textColor}
              accentColor={theme.accentColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;
