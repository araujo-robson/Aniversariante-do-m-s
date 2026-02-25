import { useState, useCallback, useRef, type DragEvent } from "react";
import Cropper, { type Area } from "react-easy-crop";

interface PhotoCardProps {
  dia: string;
  nome: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  nameAspect?: number;
  nameWidthPct?: number;
}

function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d")!;
      // Clear canvas to ensure transparency is preserved
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );
      resolve(canvas.toDataURL("image/png"));
    };
    image.src = imageSrc;
  });
}

const PhotoCard = ({ dia, nome, borderColor, textColor, accentColor, nameAspect = 3, nameWidthPct = 100 }: PhotoCardProps) => {
  const [image, setImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isCropping, setIsCropping] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setCroppedImage(null);
      setIsCropping(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirmCrop = async () => {
    if (image && croppedAreaPixels) {
      const cropped = await getCroppedImg(image, croppedAreaPixels);
      setCroppedImage(cropped);
      setIsCropping(false);
    }
  };

  const handleResetImage = () => {
    setImage(null);
    setCroppedImage(null);
    setIsCropping(false);
  };

  const nameParts = nome.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const restName = nameParts.slice(1).join(" ");

  return (
    <div className="photo-card-wrapper flex flex-col items-center w-full relative" style={{ paddingTop: "2.75mm" }}>

      {/* Photo frame wrapper - no overflow hidden so circle can overflow */}
      <div
        className="relative w-full"
        style={{
          aspectRatio: "3 / 4",
        }}
      >
        {/* Day - circle overlapping top-left corner */}
        <div
          className="day-circle absolute flex items-center justify-center rounded-full font-bold"
          style={{
            fontFamily: "var(--font-display)",
            color: "white",
            backgroundColor: accentColor,
            width: "5.5mm",
            height: "5.5mm",
            fontSize: "10pt",
            lineHeight: 1,
            top: "-2.75mm",
            left: "-2.75mm",
            zIndex: 30,
          }}
        >
          {dia}
        </div>

        {/* Photo frame inner - clips photo content */}
        <div
          className="relative overflow-hidden w-full h-full"
          style={{
            border: `2px solid ${borderColor}`,
            borderRadius: "5px",
            cursor: croppedImage ? "default" : "pointer",
          }}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => {
            if (!image && !croppedImage) inputRef.current?.click();
          }}
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

        {/* Cropping mode */}
        {isCropping && image && (
          <div className="absolute inset-0 z-10">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={3 / 4}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: { width: "100%", height: "100%", position: "absolute" },
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 flex gap-0.5 z-20 p-0.5 no-print">
              <button
                onClick={(e) => { e.stopPropagation(); handleConfirmCrop(); }}
                className="flex-1 text-white py-0.5 rounded"
                style={{ backgroundColor: accentColor, fontSize: "10pt" }}
              >
                ✓
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleResetImage(); }}
                className="flex-1 bg-gray-500 text-white py-0.5 rounded"
                style={{ fontSize: "10pt" }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Cropped result */}
        {croppedImage && !isCropping && (
          <>
            <img
              src={croppedImage}
              alt={nome}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30 no-print">
              <div className="flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsCropping(true); }}
                  className="text-white bg-black/60 px-1 py-0.5 rounded"
                  style={{ fontSize: "10pt" }}
                >
                  ✂️
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleResetImage(); }}
                  className="text-white bg-black/60 px-1 py-0.5 rounded"
                  style={{ fontSize: "10pt" }}
                >
                  🗑
                </button>
              </div>
            </div>
          </>
        )}


        {/* Empty state */}
        {!image && !croppedImage && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50/80">
            <span style={{ fontSize: "16px", opacity: 0.25 }}>📷</span>
            <span className="text-muted-foreground no-print" style={{ fontSize: "10pt" }}>
              Clique
            </span>
          </div>
        )}
        </div>
      </div>

      {/* Name - 3:1 rectangle */}
      <div
        className="name-rect flex items-center justify-center font-bold text-center mt-0.5"
        style={{
          fontFamily: "var(--font-body)",
          color: "white",
          backgroundColor: accentColor,
          borderRadius: "3px",
          fontSize: "10pt",
          lineHeight: 1.2,
          aspectRatio: `${nameAspect} / 1`,
          padding: "1px 2px",
          overflow: "hidden",
          width: `${nameWidthPct}%`,
        }}
      >
        <div className="w-full">
          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {firstName}
          </div>
          {restName && (
            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 400, fontSize: "8pt" }}>
              {restName}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoCard;
