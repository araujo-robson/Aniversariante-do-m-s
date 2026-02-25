import { useState, useRef, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Type, Move } from "lucide-react";
import html2canvas from "html2canvas";

const FONTS = [
  { label: "Fredoka One", value: "'Fredoka One', cursive" },
  { label: "Bebas Neue", value: "'Bebas Neue', sans-serif" },
  { label: "Lobster", value: "'Lobster', cursive" },
  { label: "Oswald", value: "'Oswald', sans-serif" },
  { label: "Pacifico", value: "'Pacifico', cursive" },
  { label: "Anton", value: "'Anton', sans-serif" },
];

interface Props {
  image: string;
  onDone: (dataUrl: string) => void;
  onBack: () => void;
}

const StepEditor = ({ image, onDone, onBack }: Props) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  // Text overlay state
  const [text, setText] = useState("Feliz Dia!");
  const [fontFamily, setFontFamily] = useState(FONTS[0].value);
  const [fontSize, setFontSize] = useState(48);
  const [fontColor, setFontColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [shadowColor, setShadowColor] = useState("#000000");
  const [shadowBlur, setShadowBlur] = useState(4);
  const [shadowOffsetX, setShadowOffsetX] = useState(2);
  const [shadowOffsetY, setShadowOffsetY] = useState(2);

  // Drag state
  const [textPos, setTextPos] = useState({ x: 50, y: 50 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const previewRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  // Drag handlers for text
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    setDragStart({ x: e.clientX - textPos.x, y: e.clientY - textPos.y });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDragging(true);
    setDragStart({ x: touch.clientX - textPos.x, y: touch.clientY - textPos.y });
  };

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!dragging) return;
      setTextPos({ x: clientX - dragStart.x, y: clientY - dragStart.y });
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
    const onUp = () => setDragging(false);

    if (dragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("mouseup", onUp);
      window.addEventListener("touchend", onUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, dragStart]);

  const getCroppedImg = (): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        if (croppedArea) {
          canvas.width = croppedArea.width;
          canvas.height = croppedArea.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(
            img,
            croppedArea.x,
            croppedArea.y,
            croppedArea.width,
            croppedArea.height,
            0,
            0,
            croppedArea.width,
            croppedArea.height
          );
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
        }
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = image;
    });
  };

  const handleExport = async () => {
    // Render the preview div with text overlay
    if (previewRef.current) {
      const canvas = await html2canvas(previewRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        backgroundColor: null,
      });
      onDone(canvas.toDataURL("image/png"));
    }
  };

  const textStyle: React.CSSProperties = {
    fontFamily,
    fontSize: `${fontSize}px`,
    color: fontColor,
    WebkitTextStroke: strokeWidth > 0 ? `${strokeWidth}px ${strokeColor}` : undefined,
    textShadow:
      shadowBlur > 0 || shadowOffsetX > 0 || shadowOffsetY > 0
        ? `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px ${shadowColor}`
        : "none",
    position: "absolute" as const,
    left: `${textPos.x}px`,
    top: `${textPos.y}px`,
    cursor: "move",
    userSelect: "none" as const,
    whiteSpace: "nowrap" as const,
    zIndex: 10,
    lineHeight: 1.2,
    fontWeight: "bold",
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <h2
        className="text-2xl font-bold text-center"
        style={{ fontFamily: "var(--font-display)", color: "hsl(220 20% 20%)" }}
      >
        <Type className="inline mr-2 mb-1" size={28} />
        Editar Imagem
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Crop area */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Crop section */}
            <div className="relative h-[300px]" ref={canvasContainerRef}>
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="px-4 py-2 flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1"
              />
            </div>
          </div>

          {/* Preview with text overlay */}
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <Move size={14} /> Arraste o texto na prévia abaixo
          </p>
          <div
            ref={previewRef}
            className="relative bg-black rounded-xl overflow-hidden mx-auto"
            style={{ width: "100%", maxWidth: 600, aspectRatio: "4/3" }}
          >
            <img
              src={image}
              alt="Preview"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              style={
                croppedArea
                  ? {
                      objectPosition: `${-(croppedArea.x / (croppedArea.width / 100))}% ${-(croppedArea.y / (croppedArea.height / 100))}%`,
                    }
                  : {}
              }
            />
            {text && (
              <div
                style={textStyle}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                {text}
              </div>
            )}
          </div>
        </div>

        {/* Controls panel */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-4 h-fit">
          <h3 className="font-bold text-sm text-foreground">Texto</h3>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Digite o texto..."
            className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-background"
          />

          <div>
            <label className="text-xs text-muted-foreground">Fonte</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-background mt-1"
            >
              {FONTS.map((f) => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Tamanho: {fontSize}px</label>
            <input
              type="range"
              min={12}
              max={120}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full mt-1"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Cor</label>
              <input
                type="color"
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                className="w-full h-8 rounded border border-border cursor-pointer mt-1"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Cor Borda</label>
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="w-full h-8 rounded border border-border cursor-pointer mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Espessura Borda: {strokeWidth}px</label>
            <input
              type="range"
              min={0}
              max={8}
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-full mt-1"
            />
          </div>

          <h3 className="font-bold text-sm text-foreground pt-2">Sombra</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Cor</label>
              <input
                type="color"
                value={shadowColor}
                onChange={(e) => setShadowColor(e.target.value)}
                className="w-full h-8 rounded border border-border cursor-pointer mt-1"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Desfoque: {shadowBlur}</label>
              <input
                type="range"
                min={0}
                max={20}
                value={shadowBlur}
                onChange={(e) => setShadowBlur(Number(e.target.value))}
                className="w-full mt-1"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Desl. X: {shadowOffsetX}</label>
              <input
                type="range"
                min={-20}
                max={20}
                value={shadowOffsetX}
                onChange={(e) => setShadowOffsetX(Number(e.target.value))}
                className="w-full mt-1"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Desl. Y: {shadowOffsetY}</label>
              <input
                type="range"
                min={-20}
                max={20}
                value={shadowOffsetY}
                onChange={(e) => setShadowOffsetY(Number(e.target.value))}
                className="w-full mt-1"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onBack} className="flex-1 gap-1 rounded-xl">
              <ChevronLeft size={16} /> Voltar
            </Button>
            <Button
              onClick={handleExport}
              className="flex-1 gap-1 rounded-xl text-white"
              style={{ backgroundColor: "hsl(220 80% 50%)" }}
            >
              Avançar <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepEditor;
