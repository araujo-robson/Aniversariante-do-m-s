import type { MonthTheme } from "@/lib/monthThemes";
import type { BirthdayPerson } from "@/lib/excelParser";
import PhotoCard from "@/components/PhotoCard";
import logo from "@/assets/logo.png";
import fevereiroBg from "@/assets/fevereiro-bg.png";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";

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
const GAP = 2; // gap between cards in mm

// Name area height in mm (day label + name below card)
const NAME_AREA_HEIGHT = 8;

function computeGrid(count: number) {
  let bestCols = 1;
  let bestRows = 1;
  let bestArea = 0;

  for (let cols = 2; cols <= 12; cols++) {
    const rows = Math.ceil(count / cols);
    const cardW = (BODY_WIDTH - (cols - 1) * GAP) / cols;
    const cardH = (BODY_HEIGHT - (rows - 1) * GAP) / rows;
    // Reserve space for day label + name below the photo
    const photoH = cardH - NAME_AREA_HEIGHT;
    if (photoH <= 0 || cardW <= 0) continue;
    const area = cardW * photoH;
    if (area > bestArea) {
      bestArea = area;
      bestCols = cols;
      bestRows = rows;
    }
  }

  const cardW = (BODY_WIDTH - (bestCols - 1) * GAP) / bestCols;
  const cardH = (BODY_HEIGHT - (bestRows - 1) * GAP) / bestRows;
  const photoH = cardH - NAME_AREA_HEIGHT;

  return { cols: bestCols, rows: bestRows, cardWidth: cardW, cardHeight: photoH };
}

const bgImages: Record<string, string> = {
  fevereiro: fevereiroBg,
};

const DocumentPreview = ({ month, theme, people, onBack }: DocumentPreviewProps) => {
  const { cols, rows, cardWidth, cardHeight } = computeGrid(people.length);
  const hasBgImage = !!theme.bgImage;
  const bgImageUrl = theme.bgImage ? bgImages[theme.bgImage] : null;

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
        className="a4-page print-page mx-auto relative"
        style={{
          background: bgImageUrl ? `url(${bgImageUrl}) center/cover no-repeat` : theme.bgGradient,
        }}
      >
        {/* Decorative corners - hide when bg image */}
        {!hasBgImage && (
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
          }}
        >
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="flex"
              style={{
                gap: `${GAP}mm`,
                marginBottom: rowIndex < rows - 1 ? `${GAP}mm` : 0,
              }}
            >
              {people.slice(rowIndex * cols, (rowIndex + 1) * cols).map((person, colIndex) => (
                <PhotoCard
                  key={`${rowIndex}-${colIndex}`}
                  dia={person.dia}
                  nome={person.nome}
                  borderColor={theme.cardBorder}
                  textColor={theme.textColor}
                  accentColor={theme.accentColor}
                  cardWidth={cardWidth}
                  cardHeight={cardHeight}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;
