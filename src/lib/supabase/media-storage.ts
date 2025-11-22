/**
 * Supabase Storage helper for marketplace listing media uploads
 * Handles file validation, upload, and cleanup operations
 */

import { getSupabaseBrowserClient } from "@/lib/supabase-browser"

const BUCKET_NAME = "listing-media"
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_FILES = 5
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]

export interface UploadedFile {
  id: string
  url: string
  storage_path: string
  file_type: string
  mime_type: string
  file_size: number
  alt_text?: string
  caption?: string
}

export interface UploadValidationError {
  field: string
  message: string
}

/**
 * Validate files before upload
 */
export function validateMediaFiles(
  files: File[]
): { valid: boolean; errors: UploadValidationError[] } {
  const errors: UploadValidationError[] = []

  if (files.length === 0) {
    return { valid: true, errors: [] }
  }

  if (files.length > MAX_FILES) {
    errors.push({
      field: "media",
      message: `Too many files. Maximum is ${MAX_FILES} files.`,
    })
  }

  files.forEach((file, index) => {
    // Check file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      errors.push({
        field: `media[${index}]`,
        message: `Invalid file type: ${file.type}. Only JPEG, PNG, and WebP are allowed.`,
      })
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push({
        field: `media[${index}]`,
        message: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum is 5MB.`,
      })
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Upload media files to Supabase Storage
 */
export async function uploadMediaFiles(
  listingId: string,
  files: File[]
): Promise<{ files: UploadedFile[]; errors: string[] }> {
  const uploadedFiles: UploadedFile[] = []
  const errors: string[] = []

  if (files.length === 0) {
    return { files: uploadedFiles, errors }
  }

  const supabase = getSupabaseBrowserClient()
  const timestamp = Date.now()

  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    try {
      const fileExtension = file.name.split(".").pop() || "jpg"
      const storagePath = `${listingId}/${timestamp}-${i}.${fileExtension}`

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (error) {
        errors.push(
          `Failed to upload ${file.name}: ${error.message}`
        )
        continue
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath)

      uploadedFiles.push({
        id: `${listingId}-${i}`,
        url: publicUrlData.publicUrl,
        storage_path: storagePath,
        file_type: file.type.split("/")[1] || "image",
        mime_type: file.type,
        file_size: file.size,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      errors.push(`Failed to upload ${file.name}: ${message}`)
    }
  }

  return { files: uploadedFiles, errors }
}

/**
 * Delete a media file from storage
 */
export async function deleteMediaFile(storagePath: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath])

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return { success: false, error: message }
  }
}

/**
 * Delete multiple media files from storage
 */
export async function deleteMediaFiles(storagePaths: string[]): Promise<{
  success: boolean
  errors: string[]
}> {
  const errors: string[] = []

  for (const path of storagePaths) {
    const result = await deleteMediaFile(path)
    if (!result.success) {
      errors.push(result.error || "Unknown error")
    }
  }

  return {
    success: errors.length === 0,
    errors,
  }
}
