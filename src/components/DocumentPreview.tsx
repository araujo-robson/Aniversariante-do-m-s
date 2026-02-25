import { useState, useRef } from "react";
import type { MonthTheme } from "@/lib/monthThemes";
import type { BirthdayPerson } from "@/lib/excelParser";
import PhotoCard from "@/components/PhotoCard";
import logo from "@/assets/logo.png";
import fevereiroBg from "@/assets/fevereiro-bg.png";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Printer, ArrowLeft, ImagePlus } from "lucide-react";

interface DocumentPreviewProps {
  month: number;
  theme: MonthTheme;
  people: BirthdayPerson[];
  onBack: () => void;
}

// Margins in mm (converted from cm)
const MARGIN_TOP = 65;    // 6.5cm
const MARGIN_BOTTOM = 60; // 6.0cm
const MARGIN_LEFT = 16;   // 1.6cm
const MARGIN_RIGHT = 16;  // 1.6cm

// Body area dimensions in mm
const BODY_WIDTH = 210 - MARGIN_LEFT - MARGIN_RIGHT;  // 178mm
const BODY_HEIGHT = 297 - MARGIN_TOP - MARGIN_BOTTOM;  // 172mm
const BODY_LEFT = MARGIN_LEFT;
const BODY_TOP = MARGIN_TOP;
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
  const [nameAspect, setNameAspect] = useState(3); // aspect ratio width:1 for name rect (default 3:1)
  const [gridScale, setGridScale] = useState(100); // percentage scale of the grid
  
  const bgInputRef = useRef<HTMLInputElement>(null);

  const maxCols = getMaxCols(people.length);
  const cols = Math.min(maxCols, people.length);

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

  // Use primaryColor as the accent for circles and name rectangles
  const cardAccent = theme.primaryColor;

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "hsl(220 14% 92%)" }}>
      {/* Toolbar */}
      <div className="no-print max-w-[210mm] mx-auto mb-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
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

        {/* Adjustment sliders */}
        <div className="flex items-center gap-6 bg-white rounded-lg px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3 flex-1">
            <label className="text-sm font-medium whitespace-nowrap">📐 Tamanho do Grid:</label>
            <Slider
              value={[gridScale]}
              onValueChange={([v]) => setGridScale(v)}
              min={60}
              max={120}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-10 text-right">{gridScale}%</span>
          </div>
          <div className="flex items-center gap-3 flex-1">
            <label className="text-sm font-medium whitespace-nowrap">📝 Altura do Nome:</label>
            <Slider
              value={[nameAspect]}
              onValueChange={([v]) => setNameAspect(v)}
              min={1.5}
              max={5}
              step={0.25}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-10 text-right">{nameAspect}:1</span>
          </div>
        </div>
      </div>

      {/* A4 Page */}
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
        {(() => {
          const totalRows = Math.ceil(people.length / cols);
          const lastRowCount = people.length % cols || cols;
          const fullRows = people.slice(0, people.length - (lastRowCount < cols ? lastRowCount : 0));
          const lastRow = lastRowCount < cols ? people.slice(people.length - lastRowCount) : [];

          const scaledWidth = BODY_WIDTH * (gridScale / 100);
          const scaledHeight = BODY_HEIGHT * (gridScale / 100);
          // Center the grid within the original body area
          const offsetLeft = BODY_LEFT + (BODY_WIDTH - scaledWidth) / 2;
          const offsetTop = BODY_TOP + (BODY_HEIGHT - scaledHeight) / 2;

          return (
            <div
              style={{
                position: "absolute",
                left: `${offsetLeft}mm`,
                top: `${offsetTop}mm`,
                width: `${scaledWidth}mm`,
                height: `${scaledHeight}mm`,
                display: "flex",
                flexDirection: "column",
                gap: `${GAP}mm`,
              }}
            >
              {/* Full rows grid */}
              {fullRows.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gap: `${GAP}mm`,
                  }}
                >
                  {fullRows.map((person, index) => (
                    <PhotoCard
                      key={index}
                      dia={person.dia}
                      nome={person.nome}
                      borderColor={theme.cardBorder}
                      textColor={theme.textColor}
                      accentColor={cardAccent}
                      nameAspect={nameAspect}
                    />
                  ))}
                </div>
              )}
              {/* Last row centered */}
              {lastRow.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: `${GAP}mm`,
                  }}
                >
                  {lastRow.map((person, index) => {
                    const cardWidth = `calc((${scaledWidth}mm - ${(cols - 1) * GAP}mm) / ${cols})`;
                    return (
                      <div key={fullRows.length + index} style={{ width: cardWidth }}>
                        <PhotoCard
                          dia={person.dia}
                          nome={person.nome}
                          borderColor={theme.cardBorder}
                          textColor={theme.textColor}
                          accentColor={cardAccent}
                          nameAspect={nameAspect}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default DocumentPreview;
