import { useState, useRef } from "react";
import type { MonthTheme } from "@/lib/monthThemes";
import type { BirthdayPerson } from "@/lib/excelParser";
import { exportProject } from "@/lib/projectExport";
import PhotoCard from "@/components/PhotoCard";
import { compressImage } from "@/lib/imageCompressor";
import logo from "@/assets/logo.png";
import fevereiroBg from "@/assets/fevereiro-bg.png";
import marcoBg from "@/assets/marco-bg.png";
import abrilBg from "@/assets/abril-bg.jpg";
import maioBg from "@/assets/maio-bg.jpg";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Printer, ArrowLeft, ImagePlus, Home, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DocumentPreviewProps {
  month: number;
  theme: MonthTheme;
  people: BirthdayPerson[];
  onBack: () => void;
}

// Margins in mm
const MARGIN_TOP = 65;
const MARGIN_BOTTOM = 60;
const MARGIN_LEFT = 16;
const MARGIN_RIGHT = 16;

// Body area dimensions in mm
const BODY_WIDTH = 210 - MARGIN_LEFT - MARGIN_RIGHT;
const BODY_HEIGHT = 297 - MARGIN_TOP - MARGIN_BOTTOM;
const BODY_LEFT = MARGIN_LEFT;
const BODY_TOP = MARGIN_TOP;
const GAP = 2;

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MARGEM DO PLANO DE FUNDO — NÃO ALTERAR                    ║
 * ║  Valor fixo: 5mm (0,5cm) em todos os lados.                ║
 * ║  A imagem de fundo é posicionada via <img> absoluto         ║
 * ║  dentro da página A4, usando estas constantes.              ║
 * ║  Qualquer alteração aqui afeta TODAS as impressões.         ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
const BG_MARGIN_MM = 5; // 0.5cm — NÃO ALTERAR
const BG_WIDTH_MM = 210 - BG_MARGIN_MM * 2;  // 200mm
const BG_HEIGHT_MM = 297 - BG_MARGIN_MM * 2; // 287mm

const defaultBgImages: Record<string, string> = {
  fevereiro: fevereiroBg,
  marco: marcoBg,
  abril: abrilBg,
  maio: maioBg,
};

function getMaxCols(count: number): number {
  if (count >= 25) return 7;
  return 6;
}

const DocumentPreview = ({ month, theme, people: initialPeople, onBack }: DocumentPreviewProps) => {
  const navigate = useNavigate();
  const [people, setPeople] = useState<BirthdayPerson[]>(initialPeople);

  const handleNameChange = (index: number, nome: string, setor: string, dia: string) => {
    setPeople(prev => prev.map((p, i) => i === index ? { ...p, nome, setor, dia } : p));
  };

  // Load saved custom bg from localStorage
  const savedBg = (() => {
    try { return localStorage.getItem(`bg-custom-${month}`); } catch { return null; }
  })();

  const [customBg, setCustomBg] = useState<string | null>(savedBg);
  const [nameAspect, setNameAspect] = useState(3);
  const [nameWidthPct, setNameWidthPct] = useState(100);
  const [gridScale, setGridScale] = useState(100);
  const [offsetY, setOffsetY] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [nameFontSize, setNameFontSize] = useState(10);
  
  const bgInputRef = useRef<HTMLInputElement>(null);

  const maxCols = getMaxCols(people.length);
  const cols = Math.min(maxCols, people.length);

  const hasBgImage = !!theme.bgImage;
  const bgImageUrl = customBg || (theme.bgImage ? defaultBgImages[theme.bgImage] : null);

  const handleBgUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    try {
      const compressed = await compressImage(file, 1400, 0.75);
      setCustomBg(compressed);
      try { localStorage.setItem(`bg-custom-${month}`, compressed); } catch { /* full */ }
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        setCustomBg(data);
        try { localStorage.setItem(`bg-custom-${month}`, data); } catch { /* full */ }
      };
      reader.readAsDataURL(file);
    }
  };

  const [showExportDialog, setShowExportDialog] = useState(false);

  const handlePrintClick = () => {
    setShowExportDialog(true);
  };

  const handleExportAndPrint = () => {
    exportProject(month, people);
    setShowExportDialog(false);
    setTimeout(() => window.print(), 300);
  };

  const handlePrintOnly = () => {
    setShowExportDialog(false);
    setTimeout(() => window.print(), 350);
  };

  const cardAccent = theme.primaryColor;

  // Background: usa <img> absoluto para garantir margens fixas (não CSS background)
  const hasBgImg = !!bgImageUrl;
  const pageStyle = hasBgImg
    ? { backgroundColor: "white" }
    : { background: theme.bgGradient };

  const [pageZoom, setPageZoom] = useState(1);

  return (
    <div className="print-page-wrapper min-h-screen py-8 px-4" style={{ background: "hsl(220 14% 92%)" }}>
      {/* Toolbar */}
      <div className="no-print max-w-[210mm] mx-auto mb-4 flex flex-col gap-3">
        {/* Top row: navigation + actions */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="gap-1">
              <Home size={14} /> Início
            </Button>
            <Button variant="outline" size="sm" onClick={onBack} className="gap-1">
              <ArrowLeft size={14} /> Voltar
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPageZoom(z => Math.max(0.3, z - 0.1))} title="Diminuir zoom">
                −
              </Button>
              <span className="text-xs w-10 text-center select-none">{Math.round(pageZoom * 100)}%</span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPageZoom(z => Math.min(2, z + 0.1))} title="Aumentar zoom">
                +
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => bgInputRef.current?.click()}
              className="gap-1"
            >
              <ImagePlus size={14} /> Plano de Fundo
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
              size="sm"
              onClick={handlePrintClick}
              className="gap-1 text-white rounded-xl shadow-lg"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <Printer size={14} /> Imprimir
            </Button>
          </div>
        </div>

        {/* Adjustment sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 bg-white rounded-lg px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <label className="text-xs sm:text-sm font-medium whitespace-nowrap">📐 Grid:</label>
            <Slider value={[gridScale]} onValueChange={([v]) => setGridScale(v)} min={60} max={120} step={1} className="flex-1" />
            <span className="text-xs text-muted-foreground w-10 text-right">{gridScale}%</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs sm:text-sm font-medium whitespace-nowrap">📝 Alt. Nome:</label>
            <Slider value={[nameAspect]} onValueChange={([v]) => setNameAspect(v)} min={1.5} max={5} step={0.25} className="flex-1" />
            <span className="text-xs text-muted-foreground w-10 text-right">{nameAspect}:1</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs sm:text-sm font-medium whitespace-nowrap">↕️ Pos. Y:</label>
            <Slider value={[offsetY]} onValueChange={([v]) => setOffsetY(v)} min={-40} max={40} step={0.5} className="flex-1" />
            <span className="text-xs text-muted-foreground w-10 text-right">{offsetY}mm</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs sm:text-sm font-medium whitespace-nowrap">📏 Larg. Nome:</label>
            <Slider value={[nameWidthPct]} onValueChange={([v]) => setNameWidthPct(v)} min={50} max={125} step={1} className="flex-1" />
            <span className="text-xs text-muted-foreground w-10 text-right">{nameWidthPct}%</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs sm:text-sm font-medium whitespace-nowrap">↔️ Pos. X:</label>
            <Slider value={[offsetX]} onValueChange={([v]) => setOffsetX(v)} min={-40} max={40} step={0.5} className="flex-1" />
            <span className="text-xs text-muted-foreground w-10 text-right">{offsetX}mm</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs sm:text-sm font-medium whitespace-nowrap">🔤 Tam. Nome:</label>
            <Slider value={[nameFontSize]} onValueChange={([v]) => setNameFontSize(v)} min={5} max={18} step={0.5} className="flex-1" />
            <span className="text-xs text-muted-foreground w-10 text-right">{nameFontSize}pt</span>
          </div>
        </div>
      </div>

      {/* A4 Page */}
      <div
        className="a4-page print-page mx-auto relative"
        style={{ ...pageStyle, transform: `scale(${pageZoom})`, transformOrigin: "top center", transition: "transform 0.15s ease-out" }}
      >
        {/* ── Imagem de fundo com margem fixa de 0,5cm ── NÃO ALTERAR ── */}
        {hasBgImg && (
          <img
            src={bgImageUrl}
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              top: `${BG_MARGIN_MM}mm`,
              left: `${BG_MARGIN_MM}mm`,
              width: `${BG_WIDTH_MM}mm`,
              height: `${BG_HEIGHT_MM}mm`,
              objectFit: "fill",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        )}
        {/* Decorative corners - hide when bg image */}
        {!hasBgImage && !customBg && (
          <>
            <div className="absolute top-3 right-4 text-2xl opacity-70 select-none">{theme.decorEmoji[1]}</div>
            <div className="absolute top-10 right-10 text-lg opacity-40 select-none">{theme.decorEmoji[3]}</div>
          </>
        )}

        {/* Photo Grid Body */}
        {(() => {
          const totalRows = Math.ceil(people.length / cols);
          const lastRowCount = people.length % cols || cols;
          const fullRows = people.slice(0, people.length - (lastRowCount < cols ? lastRowCount : 0));
          const lastRow = lastRowCount < cols ? people.slice(people.length - lastRowCount) : [];

          const scaledWidth = BODY_WIDTH * (gridScale / 100);
          const scaledHeight = BODY_HEIGHT * (gridScale / 100);
          const centerLeft = BODY_LEFT + (BODY_WIDTH - scaledWidth) / 2;
          const centerTop = BODY_TOP + (BODY_HEIGHT - scaledHeight) / 2;
          const finalLeft = centerLeft + offsetX;
          const finalTop = centerTop + offsetY;

          return (
            <div
              style={{
                position: "absolute",
                zIndex: 1,
                left: `${finalLeft}mm`,
                top: `${finalTop}mm`,
                width: `${scaledWidth}mm`,
                height: `${scaledHeight}mm`,
                display: "flex",
                flexDirection: "column",
                gap: `${GAP}mm`,
              }}
            >
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
                      setor={person.setor}
                      borderColor={theme.cardBorder}
                      textColor={theme.textColor}
                      accentColor={cardAccent}
                      nameAspect={nameAspect}
                      nameWidthPct={nameWidthPct}
                      nameFontSize={nameFontSize}
                      storageKey={`${month}-${index}`}
                      onNameChange={(n, s, d) => handleNameChange(index, n, s, d)}
                    />
                  ))}
                </div>
              )}
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
                    const globalIndex = fullRows.length + index;
                    return (
                      <div key={globalIndex} style={{ width: cardWidth }}>
                        <PhotoCard
                          dia={person.dia}
                          nome={person.nome}
                          setor={person.setor}
                          borderColor={theme.cardBorder}
                          textColor={theme.textColor}
                          accentColor={cardAccent}
                          nameAspect={nameAspect}
                          nameWidthPct={nameWidthPct}
                          nameFontSize={nameFontSize}
                          storageKey={`${month}-${globalIndex}`}
                          onNameChange={(n, s, d) => handleNameChange(globalIndex, n, s, d)}
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

      {/* Export dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar projeto?</DialogTitle>
            <DialogDescription>
              Deseja exportar este projeto como arquivo antes de imprimir? Assim você poderá importá-lo novamente no futuro.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handlePrintOnly}>Apenas Imprimir</Button>
            <Button onClick={handleExportAndPrint} className="gap-2">
              <Download size={16} /> Exportar e Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentPreview;
