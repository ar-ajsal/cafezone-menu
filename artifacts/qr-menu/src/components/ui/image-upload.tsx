import { useRef, useState, useCallback, useEffect } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Image as ImageIcon, Upload, X, Loader2, CloudUpload, Crop as CropIcon, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  /** If set, crop is locked to this ratio (e.g. 1 = square, 16/9, 4/3). Omit for free-form. */
  aspect?: number;
  label?: string;
}

/* ── helpers ── */
function centerAspectCrop(w: number, h: number, aspect: number) {
  return centerCrop(makeAspectCrop({ unit: "%", width: 90 }, aspect, w, h), w, h);
}

function canvasPreview(image: HTMLImageElement, canvas: HTMLCanvasElement, crop: PixelCrop) {
  const ctx = canvas.getContext("2d")!;
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const pixelRatio = window.devicePixelRatio;
  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);
  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    image,
    crop.x * scaleX, crop.y * scaleY,
    crop.width * scaleX, crop.height * scaleY,
    0, 0,
    crop.width * scaleX, crop.height * scaleY,
  );
}

async function blobFromCanvas(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((res, rej) =>
    canvas.toBlob(b => b ? res(b) : rej(new Error("Canvas empty")), "image/jpeg", 0.92)
  );
}

/* ─────────────────────────────────────────────── */
export function ImageUpload({ value, onChange, folder = "digital-menu", aspect }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  /* Crop modal state */
  const [rawSrc, setRawSrc] = useState<string | null>(null);   // object URL of selected file
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [cropAspect, setCropAspect] = useState<number | undefined>(aspect);   // live-editable

  /* When image loads inside cropper, set initial crop */
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    if (cropAspect) {
      setCrop(centerAspectCrop(width, height, cropAspect));
    } else {
      setCrop({ unit: "%", x: 5, y: 5, width: 90, height: 90 });
    }
  }, [cropAspect]);

  /* Keep canvas preview in sync */
  useEffect(() => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) return;
    canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop);
  }, [completedCrop]);

  /* Open raw image in cropper */
  const openCropper = (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please select an image file"); return; }
    if (file.size > 20 * 1024 * 1024) { setError("Image must be < 20 MB"); return; }
    setError(null);
    const url = URL.createObjectURL(file);
    setRawSrc(url);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  const cancelCrop = () => {
    if (rawSrc) URL.revokeObjectURL(rawSrc);
    setRawSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* Upload cropped canvas blob to API */
  const applyCrop = async () => {
    if (!completedCrop || !previewCanvasRef.current) return;
    setIsUploading(true);
    setError(null);
    try {
      const blob = await blobFromCanvas(previewCanvasRef.current);
      const formData = new FormData();
      formData.append("image", blob, "cropped.jpg");
      formData.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Upload failed");
      const { url } = await res.json();
      onChange(url);
      cancelCrop();
    } catch (err: any) {
      setError(err.message ?? "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* Drag handlers */
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) openCropper(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) openCropper(file);
  };

  const handleClear = () => { onChange(""); setError(null); };

  /* ── Crop modal overlay ── */
  if (rawSrc) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <CropIcon className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-gray-900 text-[15px]">Crop Image</h3>
            </div>
            <button onClick={cancelCrop} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Aspect ratio selector */}
          <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100 overflow-x-auto">
            <span className="text-xs font-semibold text-gray-500 shrink-0">Aspect:</span>
            {([
              { label: "Free", value: undefined },
              { label: "1:1", value: 1 },
              { label: "4:3", value: 4 / 3 },
              { label: "16:9", value: 16 / 9 },
              { label: "3:4", value: 3 / 4 },
              { label: "2:3", value: 2 / 3 },
            ] as { label: string; value: number | undefined }[]).map(opt => (
              <button
                key={opt.label}
                onClick={() => {
                  setCropAspect(opt.value);
                  if (imgRef.current) {
                    const { width, height } = imgRef.current;
                    setCrop(opt.value ? centerAspectCrop(width, height, opt.value) : { unit: "%", x: 5, y: 5, width: 90, height: 90 });
                  }
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  cropAspect === opt.value
                    ? "bg-primary text-white shadow"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-primary/60"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Crop area */}
          <div className="flex items-center justify-center bg-gray-900 p-4 min-h-[260px] max-h-[360px] overflow-auto">
            <ReactCrop
              crop={crop}
              onChange={(_, pct) => setCrop(pct)}
              onComplete={c => setCompletedCrop(c)}
              aspect={cropAspect}
              minWidth={30}
              minHeight={30}
            >
              <img
                ref={imgRef}
                src={rawSrc}
                alt="Crop preview"
                style={{ maxHeight: "340px", maxWidth: "100%", objectFit: "contain" }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
          </div>

          {/* Hidden preview canvas */}
          <canvas ref={previewCanvasRef} className="hidden" />

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <button onClick={cancelCrop} className="text-sm text-gray-500 hover:text-gray-700 font-medium">
              Cancel
            </button>
            {error && <p className="text-xs text-red-500 mx-3 flex-1">{error}</p>}
            <Button
              onClick={applyCrop}
              disabled={!completedCrop || isUploading}
              className="gap-2 min-w-[120px]"
            >
              {isUploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
              ) : (
                <><Check className="w-4 h-4" /> Apply & Upload</>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Normal upload zone ── */
  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative w-full h-40 rounded-xl border border-border overflow-hidden bg-muted group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={e => ((e.currentTarget as HTMLImageElement).style.display = "none")}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="bg-white/90 hover:bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition-colors flex items-center gap-1.5">
              <CropIcon className="w-3.5 h-3.5" /> Replace & Crop
            </button>
            <button type="button" onClick={handleClear}
              className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition-colors flex items-center gap-1.5">
              <X className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all cursor-pointer select-none
            ${isDragging ? "border-primary bg-primary/10 scale-[1.01] shadow-lg" : "border-border hover:border-primary/60 hover:bg-muted/40 bg-muted/20"}
            ${isUploading ? "pointer-events-none opacity-60" : ""}
          `}
        >
          {isUploading ? (
            <><Loader2 className="w-9 h-9 text-primary animate-spin" /><span className="text-sm text-muted-foreground font-medium">Uploading to Cloudinary…</span></>
          ) : isDragging ? (
            <><CloudUpload className="w-10 h-10 text-primary animate-bounce" /><span className="text-sm font-semibold text-primary">Drop to crop & upload!</span></>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Drag & drop or click to upload</p>
                <p className="text-xs text-muted-foreground mt-0.5">Image will open in <span className="text-primary font-semibold">crop editor</span> first</p>
              </div>
              <span className="text-[11px] text-muted-foreground/60">PNG, JPG, WEBP · max 20 MB</span>
            </>
          )}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <div className="flex gap-2 items-center">
        <Input
          type="url"
          value={value}
          onChange={e => { setError(null); onChange(e.target.value); }}
          placeholder="Or paste an image URL…"
          className="text-xs h-8"
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
