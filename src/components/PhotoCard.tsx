import { useState, useCallback, useRef, useEffect, type DragEvent, type MouseEvent, type KeyboardEvent } from "react";
import { compressImage } from "@/lib/imageCompressor";
import { supabase } from "@/integrations/supabase/client";

interface PhotoCardProps {
  dia: string;
  nome: string;
  setor?: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  nameAspect?: number;
  nameWidthPct?: number;
  nameFontSize?: number;
  storageKey?: string;
  onNameChange?: (nome: string, setor: string, dia: string) => void;
}

const PhotoCard = ({
  dia, nome, setor, borderColor, textColor, accentColor,
  nameAspect = 3, nameWidthPct = 100, nameFontSize = 10, storageKey, onNameChange,
}: PhotoCardProps) => {
  // Load saved state from localStorage
  const savedState = storageKey ? (() => {
    try {
      const saved = localStorage.getItem(`photocard-${storageKey}`);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  })() : null;

  const [image, setImage] = useState<string | null>(savedState?.image || null);
  const [imgOffset, setImgOffset] = useState({ x: savedState?.offsetX || 0, y: savedState?.offsetY || 0 });
  const [imgScale, setImgScale] = useState(savedState?.scale || 1);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDay, setIsEditingDay] = useState(false);
  const [editNome, setEditNome] = useState(nome);
  const [editSetor, setEditSetor] = useState(setor || "");
  const [editDia, setEditDia] = useState(dia);
  const dragStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nameContainerRef = useRef<HTMLDivElement>(null);
  const nameTextRef = useRef<HTMLDivElement>(null);

  // Save to localStorage
  useEffect(() => {
    if (!storageKey || !image) return;
    try {
      localStorage.setItem(`photocard-${storageKey}`, JSON.stringify({
        image, offsetX: imgOffset.x, offsetY: imgOffset.y, scale: imgScale,
      }));
    } catch { /* localStorage full */ }
  }, [storageKey, image, imgOffset, imgScale]);

  // Auto-shrink font size
  useEffect(() => {
    const container = nameContainerRef.current;
    const textEl = nameTextRef.current;
    if (!container || !textEl) return;
    textEl.style.fontSize = `${nameFontSize}pt`;
    let size = nameFontSize;
    while (size > 5 && (textEl.scrollHeight > container.clientHeight || textEl.scrollWidth > container.clientWidth)) {
      size -= 0.5;
      textEl.style.fontSize = `${size}pt`;
    }
  }, [nome, setor, nameAspect, nameWidthPct, nameFontSize]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    try {
      const compressed = await compressImage(file, 800, 0.7);
      setImage(compressed);
      setImgOffset({ x: 0, y: 0 });
      setImgScale(1);
    } catch {
      // Fallback to original
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setImgOffset({ x: 0, y: 0 });
        setImgScale(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // Mouse drag
  const handleMouseDown = (e: MouseEvent) => {
    if (!image) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, offsetX: imgOffset.x, offsetY: imgOffset.y };
    containerRef.current?.focus();
  };

  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setImgOffset({ x: dragStartRef.current.offsetX + dx, y: dragStartRef.current.offsetY + dy });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Keyboard controls
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!image) return;
    const moveStep = 2;
    const zoomStep = 0.03;
    switch (e.key) {
      case "ArrowUp": e.preventDefault(); setImgOffset(p => ({ ...p, y: p.y - moveStep })); break;
      case "ArrowDown": e.preventDefault(); setImgOffset(p => ({ ...p, y: p.y + moveStep })); break;
      case "ArrowLeft": e.preventDefault(); setImgOffset(p => ({ ...p, x: p.x - moveStep })); break;
      case "ArrowRight": e.preventDefault(); setImgOffset(p => ({ ...p, x: p.x + moveStep })); break;
      case "+": case "=": e.preventDefault(); setImgScale(s => Math.min(5, s + zoomStep)); break;
      case "-": case "_": e.preventDefault(); setImgScale(s => Math.max(0.1, s - zoomStep)); break;
    }
  };

  const handleResetImage = () => {
    setImage(null);
    setImgOffset({ x: 0, y: 0 });
    setImgScale(1);
    if (storageKey) localStorage.removeItem(`photocard-${storageKey}`);
  };

  return (
    <div className="photo-card-wrapper flex flex-col items-center w-full relative" style={{ paddingTop: "4.25mm" }}>
      <div className="relative w-full" style={{ aspectRatio: "3 / 4" }}>
        {/* Day circle */}
        <div
          className="day-circle absolute flex items-center justify-center rounded-full font-bold"
          style={{
            fontFamily: "var(--font-display)", color: "white", backgroundColor: accentColor,
            border: "0.25mm solid black", width: "8.5mm", height: "8.5mm", fontSize: "14pt",
            lineHeight: 1, top: "-4.25mm", left: "-4.25mm", zIndex: 30, cursor: "text",
          }}
          onClick={(e) => { e.stopPropagation(); setEditDia(dia); setIsEditingDay(true); }}
          title="Clique para editar o dia"
        >
          {isEditingDay ? (
            <input
              autoFocus
              value={editDia}
              onChange={(e) => setEditDia(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { onNameChange?.(nome, setor || "", editDia); setIsEditingDay(false); }
                if (e.key === "Escape") { setEditDia(dia); setIsEditingDay(false); }
              }}
              onBlur={() => { onNameChange?.(nome, setor || "", editDia); setIsEditingDay(false); }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: "6mm", background: "rgba(255,255,255,0.9)", color: "#000", border: "none", borderRadius: "2px", fontSize: "10pt", textAlign: "center", padding: 0 }}
            />
          ) : dia}
        </div>

        {/* Photo frame */}
        <div
          ref={containerRef}
          tabIndex={0}
          className="relative overflow-hidden w-full h-full outline-none"
          style={{
            border: `2px solid ${borderColor}`,
            borderRadius: "5px",
            cursor: image ? (isDragging ? "grabbing" : "grab") : "pointer",
          }}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => { if (!image) inputRef.current?.click(); }}
          onMouseDown={image ? handleMouseDown : undefined}
          onKeyDown={handleKeyDown}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {image && (
            <>
              <img
                src={image}
                alt={nome}
                draggable={false}
                className="absolute w-full h-full object-cover select-none"
                style={{
                  transform: `translate(${imgOffset.x}px, ${imgOffset.y}px) scale(${imgScale})`,
                  transition: isDragging ? "none" : "transform 0.15s ease-out",
                  transformOrigin: "center center",
                }}
              />
              <button
                className="absolute top-0.5 right-0.5 text-white bg-black/60 hover:bg-red-600 rounded-full w-5 h-5 flex items-center justify-center no-print"
                style={{ fontSize: "10px", zIndex: 40, pointerEvents: "auto" }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); handleResetImage(); }}
                title="Remover imagem"
              >
                ✕
              </button>
            </>
          )}

          {!image && (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50/80">
              <span style={{ fontSize: "16px", opacity: 0.25 }}>📷</span>
              <span className="text-muted-foreground no-print" style={{ fontSize: "10pt" }}>Clique</span>
            </div>
          )}
        </div>
      </div>

      {/* Name */}
      <div
        ref={nameContainerRef}
        className="name-rect flex items-center justify-center font-bold text-center mt-0.5"
        style={{
          fontFamily: "'Anton', sans-serif", color: "white", backgroundColor: accentColor,
          borderRadius: "3px", border: "0.25mm solid black", lineHeight: 1.2,
          aspectRatio: `${nameAspect} / 1`, padding: "1px 2px", overflow: "hidden", width: `${nameWidthPct}%`,
        }}
      >
        <div
          ref={nameTextRef}
          style={{
            fontSize: `${nameFontSize}pt`, width: "100%", overflow: "hidden",
            wordBreak: "break-word", textOverflow: "ellipsis", lineHeight: 1.1,
          }}
        >
          {isEditingName ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                autoFocus
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { onNameChange?.(editNome, editSetor, dia); setIsEditingName(false); }
                  if (e.key === "Escape") { setEditNome(nome); setEditSetor(setor || ""); setIsEditingName(false); }
                }}
                onBlur={() => { onNameChange?.(editNome, editSetor, dia); setIsEditingName(false); }}
                style={{ background: "rgba(255,255,255,0.9)", color: "#000", border: "1px solid #666", borderRadius: "2px", fontSize: "inherit", fontFamily: "inherit", padding: "1px 3px", width: "100%", textAlign: "center" }}
                placeholder="Nome"
              />
              <input
                value={editSetor}
                onChange={(e) => setEditSetor(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { onNameChange?.(editNome, editSetor, dia); setIsEditingName(false); }
                  if (e.key === "Escape") { setEditNome(nome); setEditSetor(setor || ""); setIsEditingName(false); }
                }}
                onBlur={() => { onNameChange?.(editNome, editSetor, dia); setIsEditingName(false); }}
                style={{ background: "rgba(255,255,255,0.9)", color: "#000", border: "1px solid #666", borderRadius: "2px", fontSize: "inherit", fontFamily: "inherit", padding: "1px 3px", width: "100%", textAlign: "center" }}
                placeholder="Setor"
              />
            </div>
          ) : (
            <div
              onClick={(e) => { e.stopPropagation(); setEditNome(nome); setEditSetor(setor || ""); setIsEditingName(true); }}
              style={{ cursor: "text" }}
              title="Clique para editar"
            >
              <div style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{nome}</div>
              {setor && (
                <div style={{ fontSize: "1em", fontWeight: 700, opacity: 0.9, marginTop: "1px", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{setor}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoCard;
