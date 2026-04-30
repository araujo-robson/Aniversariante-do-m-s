import { useRef } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onSelect: (imageUrl: string) => void;
}

const StepSearch = ({ onSelect }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    onSelect(url);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2
          className="text-3xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "hsl(220 20% 20%)" }}
        >
          <ImageIcon className="inline mr-2 mb-1" size={32} />
          Selecionar Imagem
        </h2>
        <p className="text-muted-foreground">
          Envie uma imagem do seu computador para começar
        </p>
      </div>

      {/* Upload area */}
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-border hover:border-primary rounded-2xl p-12 text-center transition-colors bg-card hover:bg-accent/30 group"
        >
          <Upload
            className="mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors"
            size={48}
          />
          <p className="text-lg font-semibold mb-1">Clique para enviar uma imagem</p>
          <p className="text-sm text-muted-foreground">
            Formatos aceitos: JPG, PNG, WEBP
          </p>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />

        <div className="text-center mt-6">
          <Button
            onClick={() => fileRef.current?.click()}
            className="gap-2 rounded-xl px-6 text-white"
            style={{ backgroundColor: "hsl(220 80% 50%)" }}
          >
            <Upload size={18} /> Anexar Imagem
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepSearch;
