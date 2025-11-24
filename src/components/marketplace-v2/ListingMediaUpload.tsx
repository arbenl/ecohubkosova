/**
 * Media upload component for listing forms
 */

"use client"

import { useTranslations } from "next-intl"
import { useRef } from "react"
import { Upload, X, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import type { UploadedFile } from "@/lib/supabase/media-storage"

interface ListingMediaUploadProps {
  selectedFiles: File[]
  previewUrls: string[]
  uploadedFiles: UploadedFile[]
  primaryIndex: number | null
  error: string | null
  uploading: boolean
  onFileSelect: (files: File[]) => void
  onRemoveSelected: (index: number) => void
  onRemoveUploaded: (index: number) => void
  onSetPrimary: (index: number) => void
  onClearError: () => void
}

export function ListingMediaUpload({
  selectedFiles,
  previewUrls,
  uploadedFiles,
  primaryIndex,
  error,
  uploading,
  onFileSelect,
  onRemoveSelected,
  onRemoveUploaded,
  onSetPrimary,
  onClearError,
}: ListingMediaUploadProps) {
  const t = useTranslations("marketplace-v2")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalFiles = selectedFiles.length + uploadedFiles.length
  const maxFiles = 5

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700 flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={onClearError}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Area */}
      <div className="border-2 border-dashed border-green-200 bg-green-50/50 rounded-lg p-6">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const files = e.currentTarget.files
            if (files) onFileSelect(Array.from(files))
          }}
          disabled={uploading || totalFiles >= maxFiles}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-3">
          <div className="p-3 bg-green-100 rounded-full">
            <Upload className="h-6 w-6 text-green-600" />
          </div>

          <div className="text-center space-y-1">
            <p className="font-medium text-gray-900">
              {t("media.uploadLabel")}
            </p>
            <p className="text-sm text-gray-600">
              {t("media.helper")}
            </p>
            <p className="text-xs text-gray-500">
              {t("media.formats")}
            </p>
          </div>

          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || totalFiles >= maxFiles}
            className="mt-2"
          >
            {uploading ? t("media.uploading") : t("media.selectFiles")}
          </Button>

          <p className="text-xs text-gray-500">
            {totalFiles}/{maxFiles} {t("media.filesSelected")}
          </p>
        </div>
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            {t("media.selectedFiles")} ({selectedFiles.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {previewUrls.map((url, index) => (
              <div
                key={`selected-${index}`}
                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
              >
                <Image
                  src={url}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => onRemoveSelected(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded hover:bg-red-600"
                  disabled={uploading}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            {t("media.uploadedFiles")} ({uploadedFiles.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {uploadedFiles.map((file, index) => (
              <div
                key={file.id}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                  primaryIndex === index
                    ? "border-green-500 ring-2 ring-green-200"
                    : "border-gray-200"
                }`}
              >
                <Image
                  src={file.url}
                  alt={file.alt_text || `Uploaded ${index + 1}`}
                  fill
                  className="object-cover"
                />

                {/* Primary Badge */}
                {primaryIndex === index && (
                  <div className="absolute top-1 left-1 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    {t("media.primary")}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {primaryIndex !== index && (
                    <button
                      type="button"
                      onClick={() => onSetPrimary(index)}
                      className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                      title={t("media.setPrimary")}
                      disabled={uploading}
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onRemoveUploaded(index)}
                    className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                    title={t("media.remove")}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Message */}
      {totalFiles === 0 && (
        <p className="text-sm text-gray-500 italic">
          {t("media.noFilesSelected")}
        </p>
      )}
    </div>
  )
}
