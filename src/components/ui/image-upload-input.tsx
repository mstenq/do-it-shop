import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./loading-spinner";
import { Upload, X, Image } from "lucide-react";
import { Button } from "./button";

interface ImageUploadInputProps {
  value?: string;
  onChange: (storageId: string | undefined) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  accept?: string;
  maxSize?: number;
  placeholder?: string;
  existingImageUrl?: string | null;
}

export const ImageUploadInput = React.forwardRef<
  HTMLDivElement,
  ImageUploadInputProps
>(
  (
    {
      value,
      onChange,
      onBlur,
      disabled = false,
      className,
      accept = "image/*",
      maxSize = 5 * 1024 * 1024, // 5MB default
      placeholder = "Drop an image here, or click to select",
      existingImageUrl,
      ...props
    },
    ref
  ) => {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

    const imageUrl = previewUrl ?? existingImageUrl;

    const handleUpload = useCallback(
      async (file: File) => {
        if (disabled) return;

        setIsUploading(true);
        setError(null);

        try {
          // Validate file size
          if (file.size > maxSize) {
            throw new Error(
              `File size too large. Maximum size is ${Math.round(
                maxSize / 1024 / 1024
              )}MB`
            );
          }

          // Generate upload URL
          const uploadUrl = await generateUploadUrl({});

          // Upload file to Convex storage
          const response = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });

          if (!response.ok) {
            throw new Error("Failed to upload image");
          }

          const { storageId } = await response.json();

          // Update form value with storage ID
          onChange(storageId);

          // Create preview URL
          const preview = URL.createObjectURL(file);
          setPreviewUrl(preview);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Upload failed");
          console.error("Upload error:", err);
        } finally {
          setIsUploading(false);
        }
      },
      [disabled, maxSize, generateUploadUrl, onChange]
    );

    const onDrop = useCallback(
      (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
          handleUpload(file);
        }
      },
      [handleUpload]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: { [accept]: [] },
      maxFiles: 1,
      disabled: disabled || isUploading,
    });

    const handleRemove = () => {
      onChange(undefined);
      setPreviewUrl(null);
      setError(null);
    };

    const hasImage = imageUrl && !error;

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <div
          {...getRootProps()}
          className={cn(
            "relative border-2 border-dashed rounded-lg transition-colors cursor-pointer",
            "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            isDragActive && "border-primary bg-primary/5",
            disabled && "cursor-not-allowed opacity-50",
            error && "border-destructive",
            hasImage
              ? "border-border bg-background"
              : "border-muted-foreground/25 bg-muted/50",
            className
          )}
          onBlur={onBlur}
        >
          <input {...getInputProps()} />

          {hasImage ? (
            // Image preview
            <div className="relative group">
              <img
                src={imageUrl}
                alt="Preview"
                className="object-contain w-full h-48 p-1 rounded-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center transition-opacity rounded-lg opacity-0 bg-black/50 group-hover:opacity-100">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Trigger file input
                      const dropzoneDiv =
                        e.currentTarget.closest("[data-rbd-droppable-id]") ||
                        e.currentTarget.closest("div");
                      const input = dropzoneDiv?.querySelector(
                        "input[type='file']"
                      ) as HTMLInputElement;
                      input?.click();
                    }}
                    disabled={disabled || isUploading}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Replace
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    disabled={disabled}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80">
                  <div className="flex items-center gap-2 text-sm">
                    <LoadingSpinner size={16} />
                    Uploading...
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Upload prompt
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4">
                {isUploading ? (
                  <LoadingSpinner size={32} className="text-primary" />
                ) : (
                  <Image className="w-12 h-12 text-muted-foreground" />
                )}
              </div>

              {isUploading ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Uploading image...</p>
                  <p className="text-xs text-muted-foreground">
                    Please wait while we process your file
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {isDragActive ? "Drop the image here" : placeholder}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports: JPEG, PNG, WebP up to{" "}
                    {Math.round(maxSize / 1024 / 1024)}MB
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-2 text-sm font-medium text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

ImageUploadInput.displayName = "ImageUploadInput";
