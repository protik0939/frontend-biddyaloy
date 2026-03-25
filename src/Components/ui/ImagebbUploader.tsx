"use client";
/* eslint-disable @next/next/no-img-element */

import imageCompression from "browser-image-compression";
import { Crop, ImagePlus, Loader2, Trash2, UploadCloud, X } from "lucide-react";
import Cropper, { type Area } from "react-easy-crop";
import { type ChangeEvent, useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type ImagebbResponse = {
  success: boolean;
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: string;
    height: string;
    size: string;
    time: string;
    expiration: string;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium?: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  status: number;
};

export interface ImagebbUploaderProps {
  value?: string;
  label?: string;
  helperText?: string;
  className?: string;
  disabled?: boolean;
  imageSizeMB?: number;
  compressionSizeKB?: number;
  cropRatio?: number;
  imagebbApiKey?: string;
  onChange?: (url: string) => void;
  onUploadResult?: (result: ImagebbResponse) => void;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image for cropping"));
  });
}

async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: Area,
  outputType: string,
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas context is not available");
  }

  canvas.width = Math.max(1, Math.floor(pixelCrop.width));
  canvas.height = Math.max(1, Math.floor(pixelCrop.height));

  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const quality = outputType === "image/png" ? undefined : 0.92;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to generate cropped image"));
          return;
        }
        resolve(blob);
      },
      outputType,
      quality,
    );
  });
}

function bytesToDisplay(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}

export default function ImagebbUploader({
  value,
  label = "Image Upload",
  helperText,
  className,
  disabled,
  imageSizeMB = 8,
  compressionSizeKB = 300,
  cropRatio = 1,
  imagebbApiKey,
  onChange,
  onUploadResult,
}: Readonly<ImagebbUploaderProps>) {
  const [previewUrl, setPreviewUrl] = useState(value ?? "");
  const [imageSource, setImageSource] = useState("");
  const [fileName, setFileName] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropAreaPixels, setCropAreaPixels] = useState<Area | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const maxBytes = useMemo(() => imageSizeMB * 1024 * 1024, [imageSizeMB]);
  const targetSizeMB = useMemo(() => Math.max(compressionSizeKB / 1024, 0.05), [compressionSizeKB]);

  useEffect(() => {
    setPreviewUrl(value ?? "");
  }, [value]);

  useEffect(() => {
    return () => {
      if (imageSource.startsWith("blob:")) {
        URL.revokeObjectURL(imageSource);
      }
    };
  }, [imageSource]);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setError("Only image files are supported");
      return;
    }

    if (selectedFile.size > maxBytes) {
      setError(`Image size must be ${imageSizeMB}MB or less`);
      return;
    }

    setError("");
    setFileName(selectedFile.name);

    const objectUrl = URL.createObjectURL(selectedFile);
    if (imageSource.startsWith("blob:")) {
      URL.revokeObjectURL(imageSource);
    }

    setImageSource(objectUrl);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setIsCropOpen(true);
  };

  const closeCropper = () => {
    setIsCropOpen(false);
    if (imageSource.startsWith("blob:")) {
      URL.revokeObjectURL(imageSource);
    }
    setImageSource("");
    setCropAreaPixels(null);
    setFileName("");
  };

  const uploadToImagebb = async (file: File) => {
    const apiKey = imagebbApiKey || process.env.NEXT_PUBLIC_IMAGEBB_API_KEY;

    if (!apiKey) {
      throw new Error("ImageBB API key is missing. Set NEXT_PUBLIC_IMAGEBB_API_KEY.");
    }

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    const body = (await response.json()) as ImagebbResponse;

    if (!response.ok || !body.success) {
      throw new Error("Image upload failed. Please try again.");
    }

    return body;
  };

  const handleCropAndUpload = async () => {
    if (!imageSource || !cropAreaPixels) {
      setError("Please adjust crop area before uploading");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const outputType = "image/jpeg";
      const croppedBlob = await getCroppedBlob(imageSource, cropAreaPixels, outputType);

      const croppedFile = new File([croppedBlob], `cropped-${Date.now()}.jpg`, {
        type: outputType,
      });

      const compressedFile = await imageCompression(croppedFile, {
        maxSizeMB: targetSizeMB,
        useWebWorker: true,
        fileType: outputType,
        initialQuality: 0.9,
      });

      const result = await uploadToImagebb(compressedFile);
      const uploadedUrl = result.data.display_url || result.data.url;

      setPreviewUrl(uploadedUrl);
      onChange?.(uploadedUrl);
      onUploadResult?.(result);
      closeCropper();
    } catch (uploadError) {
      const uploadMessage =
        uploadError instanceof Error ? uploadError.message : "Image upload failed";
      setError(uploadMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const clearPreview = () => {
    setPreviewUrl("");
    onChange?.("");
    setError("");
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">
          {helperText ??
            `Max input ${imageSizeMB}MB, compress to ~${compressionSizeKB}KB, crop ratio ${cropRatio}:1`}
        </p>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">
            <ImagePlus className="h-4 w-4" />
            Select image
            <input
              type="file"
              accept="image/*"
              disabled={disabled || isUploading}
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>

          {previewUrl ? (
            <button
              type="button"
              onClick={clearPreview}
              disabled={disabled || isUploading}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          ) : null}
        </div>

        {previewUrl ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-border/70 bg-background/60">
            <img src={previewUrl} alt="Uploaded preview" className="max-h-64 w-full object-contain" />
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-border/80 bg-background/60 px-4 py-8 text-center">
            <UploadCloud className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No image uploaded yet</p>
          </div>
        )}
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}

      {isCropOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-border bg-card p-4 shadow-2xl sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crop className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">Crop and Upload</p>
              </div>
              <button
                type="button"
                onClick={closeCropper}
                className="rounded-lg border border-border bg-background p-2 text-muted-foreground transition hover:text-foreground"
                aria-label="Close crop dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-3 text-xs text-muted-foreground">
              {fileName} • target approx {compressionSizeKB}KB ({bytesToDisplay(compressionSizeKB * 1024)})
            </p>

            <div className="relative h-[300px] overflow-hidden rounded-xl bg-black sm:h-[380px]">
              <Cropper
                image={imageSource}
                crop={crop}
                zoom={zoom}
                aspect={cropRatio}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedPixels) => setCropAreaPixels(croppedPixels)}
                objectFit="contain"
              />
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeCropper}
                disabled={isUploading}
                className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleCropAndUpload()}
                disabled={isUploading}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isUploading ? "Uploading..." : "Crop, Compress & Upload"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
