import { Button } from "@/components/ui/button";
import { ChevronLeft, Printer } from "lucide-react";
import type { PrintFormat } from "@/pages/DiaDasProfissoes";

interface Props {
  image: string;
  format: PrintFormat;
  onBack: () => void;
}

const StepPreview = ({ image, format, onBack }: Props) => {
  const isLandscape = format.orientation === "landscape";
  const pageW = isLandscape ? "297mm" : "210mm";
  const pageH = isLandscape ? "210mm" : "297mm";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-page-wrapper min-h-screen bg-muted pb-12">
      {/* Controls */}
      <div className="no-print sticky top-[52px] z-40 bg-card border-b border-border px-4 py-3 flex items-center justify-between max-w-4xl mx-auto rounded-b-xl shadow-sm">
        <Button variant="outline" onClick={onBack} className="gap-1 rounded-xl">
          <ChevronLeft size={16} /> Voltar
        </Button>
        <Button
          onClick={handlePrint}
          className="gap-2 rounded-xl text-white"
          style={{ backgroundColor: "hsl(220 80% 50%)" }}
        >
          <Printer size={16} /> Imprimir
        </Button>
      </div>

      {/* A4 Page */}
      <div className="flex justify-center mt-6 no-print-wrapper">
        <div
          className="print-page bg-white shadow-2xl overflow-hidden"
          style={{
            width: pageW,
            height: pageH,
            minWidth: pageW,
            minHeight: pageH,
            maxWidth: pageW,
            maxHeight: pageH,
          }}
        >
          <div
            className="w-full h-full grid"
            style={{
              gridTemplateColumns: `repeat(${format.cols}, 1fr)`,
              gridTemplateRows: `repeat(${format.rows}, 1fr)`,
              gap: 0,
            }}
          >
            {Array.from({ length: format.cols * format.rows }).map((_, idx) => (
              <div key={idx} className="overflow-hidden">
                <img
                  src={image}
                  alt={`Imagem ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepPreview;
