"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/profile/form-field"
import { FormStatus } from "@/components/profile/form-status"
import { ListingMediaUpload } from "@/components/marketplace-v2/ListingMediaUpload"
import { useListingForm } from "@/hooks/use-listing-form"
import { useListingMedia } from "@/hooks/use-listing-media"
import type { ListingFormInput } from "@/validation/listings"

interface ListingFormV2Props {
  initialData?: Partial<ListingFormInput>
  submit: (data: ListingFormInput) => Promise<{ error?: string } | void>
  categories: Array<{ id: string; name_en: string; name_sq: string }>
  mode: "create" | "edit"
}

const FLOW_TYPES = [
  "OFFER_WASTE",
  "OFFER_MATERIAL",
  "OFFER_RECYCLED_PRODUCT",
  "REQUEST_MATERIAL",
  "SERVICE_REPAIR",
  "SERVICE_REFURBISH",
  "SERVICE_COLLECTION",
  "SERVICE_CONSULTING",
  "SERVICE_OTHER",
]

const CONDITIONS = [
  "NEW",
  "USED_EXCELLENT",
  "USED_GOOD",
  "USED_FAIR",
  "USED_REPAIRABLE",
  "SCRAP",
  "WASTE_STREAM",
]

const LIFECYCLE_STAGES = [
  "RAW_MATERIAL",
  "COMPONENT",
  "SEMIFINISHED",
  "FINISHED_PRODUCT",
  "END_OF_LIFE",
  "WASTE",
]

const PRICING_TYPES = ["FIXED", "NEGOTIABLE", "FREE", "BARTER", "ON_REQUEST"]

const ECO_LABELS = ["recycled", "upcycled", "local", "repairable"]

export function ListingFormV2({ initialData, submit, categories, mode }: ListingFormV2Props) {
  const t = useTranslations("marketplace-v2")
  const { formData, fieldErrors, saving, error, success, handleChange, handleSubmit } =
    useListingForm({
      initialData,
      submit,
    })

  const media = useListingMedia()

  return (
    <div className="max-w-2xl mx-auto">
      <FormStatus error={error} success={success} />
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          
          // Upload selected files if any
          if (media.state.selectedFiles.length > 0) {
            // Use title + timestamp as listing identifier for storage
            const listingKey = `temp-${Date.now()}`
            const uploadResult = await media.handleUploadSelected(listingKey)
            if (!uploadResult.success) {
              return
            }
          }

          // Build media data with primary and sort_order
          const mediaData = media.state.uploadedFiles.map((file, index) => ({
            ...file,
            is_primary: index === media.state.primaryIndex,
            sort_order: index,
          }))

          // Create new form data with media
          const submissionData: ListingFormInput = {
            ...formData,
            media: mediaData,
          } as ListingFormInput

          // Call original submit
          await submit(submissionData)
        }}
        className="space-y-6"
      >
        {/* Title */}
        <FormField label={t("form.title")} name="title" error={fieldErrors.title}>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Give your listing a clear title"
            maxLength={100}
          />
        </FormField>

        {/* Description */}
        <FormField
          label={t("form.description")}
          name="description"
          error={fieldErrors.description}
        >
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your listing in detail..."
            rows={5}
            maxLength={2000}
            className="w-full px-3 py-2 border rounded-md"
          />
        </FormField>

        {/* Category */}
        <FormField label={t("form.category")} name="category_id" error={fieldErrors.category_id}>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name_en}
              </option>
            ))}
          </select>
        </FormField>

        {/* Flow Type */}
        <FormField
          label={t("form.flowType")}
          name="flow_type"
          error={fieldErrors.flow_type}
        >
          <select
            name="flow_type"
            value={formData.flow_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            {FLOW_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`flowTypes.${type}`)}
              </option>
            ))}
          </select>
        </FormField>

        {/* Condition (optional) */}
        <FormField label={t("form.condition")} name="condition">
          <select
            name="condition"
            value={formData.condition || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Not specified</option>
            {CONDITIONS.map((cond) => (
              <option key={cond} value={cond}>
                {t(`conditions.${cond}`)}
              </option>
            ))}
          </select>
        </FormField>

        {/* Lifecycle Stage (optional) */}
        <FormField label={t("form.lifecycleStage")} name="lifecycle_stage">
          <select
            name="lifecycle_stage"
            value={formData.lifecycle_stage || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Not specified</option>
            {LIFECYCLE_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {t(`lifecycleStages.${stage}`)}
              </option>
            ))}
          </select>
        </FormField>

        {/* Quantity & Unit */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label={t("form.quantity")} name="quantity">
            <Input
              name="quantity"
              type="number"
              value={formData.quantity || ""}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
            />
          </FormField>
          <FormField label={t("form.unit")} name="unit">
            <Input
              name="unit"
              value={formData.unit || ""}
              onChange={handleChange}
              placeholder="kg, tons, units..."
              maxLength={20}
            />
          </FormField>
        </div>

        {/* Price & Pricing Type */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label={t("form.price")} name="price">
            <Input
              name="price"
              type="number"
              value={formData.price || ""}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
            />
          </FormField>
          <FormField label={t("form.pricingType")} name="pricing_type">
            <select
              name="pricing_type"
              value={formData.pricing_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              {PRICING_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`pricingTypes.${type}`)}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Currency */}
        <FormField label={t("form.currency")} name="currency">
          <Input
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            maxLength={3}
            placeholder="EUR"
          />
        </FormField>

        {/* Location */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">{t("detail.location")}</h3>

          <FormField label={t("form.country")} name="country">
            <Input
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="XK"
              maxLength={2}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <FormField label={t("form.city")} name="city">
              <Input
                name="city"
                value={formData.city || ""}
                onChange={handleChange}
                placeholder="City"
                maxLength={100}
              />
            </FormField>
            <FormField label={t("form.region")} name="region">
              <Input
                name="region"
                value={formData.region || ""}
                onChange={handleChange}
                placeholder="Region"
                maxLength={100}
              />
            </FormField>
          </div>

          <FormField label={t("form.locationDetails")} name="location_details">
            <textarea
              name="location_details"
              value={formData.location_details || ""}
              onChange={handleChange}
              placeholder="Street address, building details, etc..."
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border rounded-md"
            />
          </FormField>
        </div>

        {/* Eco Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">{t("detail.ecoInfo")}</h3>

          {/* Eco Labels */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">{t("form.ecoLabels")}</label>
            <div className="space-y-2">
              {ECO_LABELS.map((label) => (
                <div key={label} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`eco_label_${label}`}
                    name="eco_labels"
                    value={label}
                    checked={formData.eco_labels?.includes(label) ?? false}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <label htmlFor={`eco_label_${label}`} className="ml-2">
                    {t(`ecoLabels.${label}`)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Eco Score */}
          <FormField label={t("form.ecoScore")} name="eco_score">
            <div className="flex items-center gap-4">
              <Input
                name="eco_score"
                type="number"
                value={formData.eco_score || ""}
                onChange={handleChange}
                placeholder="0-100"
                min="0"
                max="100"
                className="flex-1"
              />
              <span className="text-sm text-gray-500">0-100</span>
            </div>
          </FormField>
        </div>

        {/* Tags */}
        <FormField label={t("form.tags")} name="tags">
          <Input
            name="tags"
            value={formData.tags?.join(", ") || ""}
            onChange={(e) => {
              const tags = e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
              handleChange({
                ...e,
                target: { ...e.target, name: "tags", value: tags.join(", ") },
              } as any)
            }}
            placeholder="Tag1, Tag2, Tag3... (comma separated)"
          />
        </FormField>

        {/* Media Upload */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">{t("media.uploadLabel")}</h3>
          <ListingMediaUpload
            selectedFiles={media.state.selectedFiles}
            previewUrls={media.state.previewUrls}
            uploadedFiles={media.state.uploadedFiles}
            primaryIndex={media.state.primaryIndex}
            error={media.state.error}
            uploading={media.state.uploading}
            onFileSelect={media.handleFileSelect}
            onRemoveSelected={media.handleRemoveSelected}
            onRemoveUploaded={media.handleRemoveUploaded}
            onSetPrimary={media.handleSetPrimary}
            onClearError={media.clearError}
          />
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-6 border-t">
          <Button type="submit" disabled={saving} className="flex-1">
            {saving
              ? "Saving..."
              : mode === "create"
                ? t("form.addListing")
                : t("form.editListing")}
          </Button>
        </div>
      </form>
    </div>
  )
}
