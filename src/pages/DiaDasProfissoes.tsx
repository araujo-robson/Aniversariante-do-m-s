import { useState, useCallback } from "react";
import StepSearch from "@/components/profissoes/StepSearch";
import StepEditor from "@/components/profissoes/StepEditor";
import StepFormat from "@/components/profissoes/StepFormat";
import StepPreview from "@/components/profissoes/StepPreview";

export interface TextOverlay {
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  x: number;
  y: number;
}

export interface PrintFormat {
  label: string;
  orientation: "landscape" | "portrait";
  cols: number;
  rows: number;
}

const DiaDasProfissoes = () => {
  const [step, setStep] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [format, setFormat] = useState<PrintFormat | null>(null);

  const handleImageSelect = useCallback((imgUrl: string) => {
    setSelectedImage(imgUrl);
    setStep(2);
  }, []);

  const handleEditorDone = useCallback((dataUrl: string) => {
    setFinalImage(dataUrl);
    setStep(3);
  }, []);

  const handleFormatSelect = useCallback((fmt: PrintFormat) => {
    setFormat(fmt);
    setStep(4);
  }, []);

  return (
    <div className="min-h-screen bg-muted">
      {/* Progress bar */}
      <div className="no-print sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className="h-2 rounded-full flex-1 transition-all duration-300"
                style={{
                  backgroundColor: s <= step ? "hsl(220 80% 50%)" : "hsl(220 14% 86%)",
                }}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Etapa {step} de 4 —{" "}
            {step === 1 && "Buscar Imagem"}
            {step === 2 && "Editar Imagem"}
            {step === 3 && "Formato de Impressão"}
            {step === 4 && "Visualização Final"}
          </p>
        </div>
      </div>

      {step === 1 && <StepSearch onSelect={handleImageSelect} />}
      {step === 2 && selectedImage && (
        <StepEditor image={selectedImage} onDone={handleEditorDone} onBack={() => setStep(1)} />
      )}
      {step === 3 && finalImage && (
        <StepFormat onSelect={handleFormatSelect} onBack={() => setStep(2)} />
      )}
      {step === 4 && finalImage && format && (
        <StepPreview image={finalImage} format={format} onBack={() => setStep(3)} />
      )}
    </div>
  );
};

export default DiaDasProfissoes;
