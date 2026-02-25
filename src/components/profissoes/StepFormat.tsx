import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import type { PrintFormat } from "@/pages/DiaDasProfissoes";

interface Props {
  onSelect: (format: PrintFormat) => void;
  onBack: () => void;
}

const formats: (PrintFormat & { desc: string })[] = [
  { label: "A4 Paisagem — Imagem Única", orientation: "landscape", cols: 1, rows: 1, desc: "1 imagem em página cheia" },
  { label: "A4 Retrato — Imagem Única", orientation: "portrait", cols: 1, rows: 1, desc: "1 imagem em página cheia" },
  { label: "A4 Paisagem — 2×3", orientation: "landscape", cols: 2, rows: 3, desc: "6 imagens (2 col × 3 lin)" },
  { label: "A4 Retrato — 3×2", orientation: "portrait", cols: 3, rows: 2, desc: "6 imagens (3 col × 2 lin)" },
  { label: "A4 Paisagem — 5×7", orientation: "landscape", cols: 5, rows: 7, desc: "35 imagens (5 col × 7 lin)" },
  { label: "A4 Retrato — 7×5", orientation: "portrait", cols: 7, rows: 5, desc: "35 imagens (7 col × 5 lin)" },
];

const StepFormat = ({ onSelect, onBack }: Props) => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2
        className="text-2xl font-bold text-center"
        style={{ fontFamily: "var(--font-display)", color: "hsl(220 20% 20%)" }}
      >
        📐 Escolha o Formato de Impressão
      </h2>
      <p className="text-center text-muted-foreground text-sm">
        Selecione como a imagem será distribuída na página A4
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {formats.map((fmt, i) => {
          const isLandscape = fmt.orientation === "landscape";
          const w = isLandscape ? 140 : 100;
          const h = isLandscape ? 100 : 140;

          return (
            <button
              key={i}
              onClick={() => onSelect(fmt)}
              className="group bg-card border-2 border-border hover:border-primary rounded-2xl p-4 transition-all hover:shadow-lg hover:scale-[1.02] text-left"
            >
              {/* Mini preview */}
              <div className="flex justify-center mb-3">
                <div
                  className="border border-border bg-muted rounded-sm overflow-hidden"
                  style={{ width: w, height: h }}
                >
                  <div
                    className="w-full h-full grid gap-px bg-border"
                    style={{
                      gridTemplateColumns: `repeat(${fmt.cols}, 1fr)`,
                      gridTemplateRows: `repeat(${fmt.rows}, 1fr)`,
                    }}
                  >
                    {Array.from({ length: fmt.cols * fmt.rows }).map((_, idx) => (
                      <div
                        key={idx}
                        className="bg-blue-100 group-hover:bg-blue-200 transition-colors"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <h3 className="font-bold text-sm text-foreground">{fmt.label}</h3>
              <p className="text-xs text-muted-foreground">{fmt.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="text-center">
        <Button variant="outline" onClick={onBack} className="gap-2 rounded-xl px-6">
          <ChevronLeft size={16} /> Voltar
        </Button>
      </div>
    </div>
  );
};

export default StepFormat;
