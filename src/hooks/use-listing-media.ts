/**
 * Hook for managing media selection and upload state in listing forms
 */

"use client"

import { useState, useCallback } from "react"
import { validateMediaFiles, uploadMediaFiles, deleteMediaFile } from "@/lib/supabase/media-storage"
import type { UploadedFile } from "@/lib/supabase/media-storage"

export interface MediaFormState {
  selectedFiles: File[]
  uploadedFiles: UploadedFile[]
  previewUrls: string[]
  primaryIndex: number | null
  uploading: boolean
  error: string | null
}

interface UseListingMediaArgs {
  maxFiles?: number
}

export function useListingMedia({ maxFiles = 5 }: UseListingMediaArgs = {}) {
  const [state, setState] = useState<MediaFormState>({
    selectedFiles: [],
    uploadedFiles: [],
    previewUrls: [],
    primaryIndex: 0, // First image is primary by default
    uploading: false,
    error: null,
  })

  const handleFileSelect = useCallback((files: FileList | File[]) => {
    setState((prev) => {
      const newFiles = Array.from(files)
      const totalFiles = prev.uploadedFiles.length + newFiles.length

      if (totalFiles > maxFiles) {
        return {
          ...prev,
          error: `Too many files. Maximum is ${maxFiles} files total.`,
        }
      }

      // Validate files
      const validation = validateMediaFiles(newFiles)
      if (!validation.valid) {
        const firstError = validation.errors[0]?.message || "Invalid files"
        return {
          ...prev,
          error: firstError,
        }
      }

      // Create preview URLs
      const previewUrls = newFiles.map((file) => URL.createObjectURL(file))

      return {
        ...prev,
        selectedFiles: newFiles,
        previewUrls,
        error: null,
      }
    })
  }, [maxFiles])

  const handleRemoveSelected = useCallback((index: number) => {
    setState((prev) => {
      const newSelectedFiles = prev.selectedFiles.filter((_, i) => i !== index)
      const newPreviewUrls = prev.previewUrls.filter((_, i) => i !== index)

      return {
        ...prev,
        selectedFiles: newSelectedFiles,
        previewUrls: newPreviewUrls,
      }
    })
  }, [])

  const handleRemoveUploaded = useCallback(async (index: number) => {
    const file = state.uploadedFiles[index]
    if (!file || !file.storage_path) return

    setState((prev) => ({
      ...prev,
      uploading: true,
      error: null,
    }))

    const result = await deleteMediaFile(file.storage_path)

    if (!result.success) {
      setState((prev) => ({
        ...prev,
        uploading: false,
        error: result.error || "Failed to delete file",
      }))
      return
    }

    setState((prev) => {
      const newUploadedFiles = prev.uploadedFiles.filter((_, i) => i !== index)
      const newPrimaryIndex = prev.primaryIndex === index ? 0 : prev.primaryIndex

      return {
        ...prev,
        uploadedFiles: newUploadedFiles,
        uploading: false,
        primaryIndex: newUploadedFiles.length > 0 ? (newPrimaryIndex ?? 0) : null,
      }
    })
  }, [state.uploadedFiles])

  const handleSetPrimary = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      primaryIndex: index,
    }))
  }, [])

  const handleUploadSelected = useCallback(
    async (listingId: string) => {
      if (state.selectedFiles.length === 0) {
        return { success: true, files: [] }
      }

      setState((prev) => ({
        ...prev,
        uploading: true,
        error: null,
      }))

      const result = await uploadMediaFiles(listingId, state.selectedFiles)

      if (result.errors.length > 0) {
        setState((prev) => ({
          ...prev,
          uploading: false,
          error: result.errors[0] || "Upload failed",
        }))
        return {
          success: false,
          files: result.files,
          errors: result.errors,
        }
      }

      setState((prev) => {
        const newUploadedFiles = [...prev.uploadedFiles, ...result.files]
        const newPrimaryIndex = prev.primaryIndex ?? 0

        return {
          ...prev,
          uploadedFiles: newUploadedFiles,
          selectedFiles: [],
          previewUrls: [],
          uploading: false,
          error: null,
          primaryIndex: newPrimaryIndex,
        }
      })

      return { success: true, files: result.files }
    },
    [state.selectedFiles]
  )

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }))
  }, [])

  return {
    state,
    handleFileSelect,
    handleRemoveSelected,
    handleRemoveUploaded,
    handleSetPrimary,
    handleUploadSelected,
    clearError,
  }
}
