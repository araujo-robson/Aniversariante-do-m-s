import { useState, useCallback, useRef, type DragEvent } from "react";
import Cropper, { type Area } from "react-easy-crop";

interface PhotoCardProps {
  dia: string;
  nome: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
}

function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d")!;
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
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    image.src = imageSrc;
  });
}

const PhotoCard = ({ dia, nome, borderColor, textColor, accentColor }: PhotoCardProps) => {
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

  return (
    <div className="flex flex-col items-center" style={{ width: "100%" }}>
      {/* Day */}
      <div
        className="font-bold text-sm mb-0.5 no-print-hide"
        style={{
          fontFamily: "var(--font-display)",
          color: textColor,
          fontSize: "11px",
        }}
      >
        {dia}
      </div>

      {/* Photo frame */}
      <div
        className="photo-card relative"
        style={{
          borderColor: borderColor,
          width: "90px",
          height: "100px",
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
              aspect={90 / 100}
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
                className="flex-1 text-white text-xs py-0.5 rounded"
                style={{ backgroundColor: accentColor, fontSize: "9px" }}
              >
                ✓
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleResetImage(); }}
                className="flex-1 bg-gray-500 text-white text-xs py-0.5 rounded"
                style={{ fontSize: "9px" }}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCropping(true);
                  }}
                  className="text-white text-xs bg-black/60 px-1.5 py-0.5 rounded"
                  style={{ fontSize: "9px" }}
                >
                  ✂️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetImage();
                  }}
                  className="text-white text-xs bg-black/60 px-1.5 py-0.5 rounded"
                  style={{ fontSize: "9px" }}
                >
                  🗑
                </button>
              </div>
            </div>
          </>
        )}

        {/* Empty state */}
        {!image && !croppedImage && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
            <span style={{ fontSize: "20px", opacity: 0.3 }}>📷</span>
            <span className="text-muted-foreground no-print" style={{ fontSize: "7px" }}>
              Clique ou arraste
            </span>
          </div>
        )}
      </div>

      {/* Name */}
      <div
        className="font-bold text-center mt-0.5 leading-tight"
        style={{
          fontFamily: "var(--font-body)",
          color: textColor,
          fontSize: "8px",
          maxWidth: "90px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {nome}
      </div>
    </div>
  );
};

export default PhotoCard;
