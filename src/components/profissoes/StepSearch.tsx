import { useState, useRef } from "react";
import { Search, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onSelect: (imageUrl: string) => void;
}

interface PixabayImage {
  id: number;
  webformatURL: string;
  largeImageURL: string;
  tags: string;
}

const PIXABAY_KEY = import.meta.env.VITE_PIXABAY_KEY || "";

const StepSearch = ({ onSelect }: Props) => {
  const [query, setQuery] = useState("");
  const [images, setImages] = useState<PixabayImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const search = async () => {
    if (!query.trim()) return;
    if (!PIXABAY_KEY) {
      alert("Chave da API Pixabay não configurada. Adicione VITE_PIXABAY_KEY nas variáveis de ambiente.");
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=20`
      );
      const data = await res.json();
      setImages(data.hits || []);
    } catch {
      setImages([]);
    }
    setLoading(false);
  };

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
          Buscar Imagem
        </h2>
        <p className="text-muted-foreground">Pesquise imagens ou envie do seu computador</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 max-w-xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Ex: enfermeira, engenheiro, professor..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-border focus:border-primary focus:outline-none transition-colors bg-card"
          />
        </div>
        <Button
          onClick={search}
          disabled={loading}
          className="px-6 rounded-xl text-white"
          style={{ backgroundColor: "hsl(220 80% 50%)" }}
        >
          {loading ? "..." : "Buscar"}
        </Button>
      </div>

      {/* Upload button */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => fileRef.current?.click()}
          className="gap-2 rounded-xl px-6"
        >
          <Upload size={18} /> Anexar Imagem
        </Button>
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
      </div>

      {/* Results grid */}
      {loading && (
        <div className="text-center py-12 text-muted-foreground">Buscando imagens...</div>
      )}

      {!loading && searched && images.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Nenhuma imagem encontrada. Tente outros termos.
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img) => (
          <button
            key={img.id}
            onClick={() => onSelect(img.largeImageURL)}
            className="group relative rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-all hover:shadow-lg aspect-square"
          >
            <img
              src={img.webformatURL}
              alt={img.tags}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              crossOrigin="anonymous"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity text-sm bg-black/50 px-3 py-1 rounded-full">
                Selecionar
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StepSearch;
