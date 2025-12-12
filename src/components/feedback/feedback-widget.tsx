/**
 * EcoHub Kosova – Feedback Widget
 * MIT License – feel free to reuse in other projects.
 * Copyright (c) 2025 Kosovo Advocacy and Development Center (KADC)
 *
 * A floating feedback button that allows users to submit feedback.
 * Collects NPS (Net Promoter Score) and freeform comments.
 */

"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { MessageCircle, X, Send, Star, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type FeedbackStep = "closed" | "rating" | "comment" | "submitted"

export function FeedbackWidget() {
  const t = useTranslations("feedback")
  const [step, setStep] = useState<FeedbackStep>("closed")
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRatingSelect = (value: number) => {
    setRating(value)
    setStep("comment")
  }

  const handleSubmit = async () => {
    if (!rating) return

    setIsSubmitting(true)

    try {
      // TODO: Implement actual feedback submission
      // await fetch('/api/feedback', {
      //   method: 'POST',
      //   body: JSON.stringify({ rating, comment }),
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setStep("submitted")

      // Reset after 3 seconds
      setTimeout(() => {
        setStep("closed")
        setRating(null)
        setComment("")
      }, 3000)
    } catch (error) {
      console.error("Failed to submit feedback:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep("closed")
    setRating(null)
    setComment("")
  }

  if (step === "closed") {
    return (
      <button
        onClick={() => setStep("rating")}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "flex items-center gap-2 px-4 py-3",
          "bg-emerald-600 hover:bg-emerald-700 text-white",
          "rounded-full shadow-lg",
          "transition-all duration-200",
          "hover:scale-105 active:scale-95",
          "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        )}
        aria-label={t("openButton")}
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-medium hidden sm:inline">{t("openButton")}</span>
      </button>
    )
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "w-80 bg-white rounded-2xl shadow-2xl",
        "border border-gray-100",
        "animate-in slide-in-from-bottom-4 fade-in duration-300"
      )}
      role="dialog"
      aria-labelledby="feedback-title"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 id="feedback-title" className="font-semibold text-gray-900">
          {step === "submitted" ? t("thankYouTitle") : t("title")}
        </h3>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label={t("close")}
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {step === "rating" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{t("ratingQuestion")}</p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleRatingSelect(value)}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    "hover:bg-emerald-50 hover:scale-110",
                    "focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  )}
                  aria-label={t("starLabel", { count: value })}
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      rating && value <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300 hover:text-amber-400"
                    )}
                  />
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{t("notLikely")}</span>
              <span>{t("veryLikely")}</span>
            </div>
          </div>
        )}

        {step === "comment" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    className={cn(
                      "h-4 w-4",
                      rating && value <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <button
                onClick={() => setStep("rating")}
                className="text-xs text-emerald-600 hover:underline"
              >
                {t("changeRating")}
              </button>
            </div>

            <div>
              <label htmlFor="feedback-comment" className="sr-only">
                {t("commentLabel")}
              </label>
              <Textarea
                id="feedback-comment"
                placeholder={t("commentPlaceholder")}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                {t("skipComment")}
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? (
                  t("sending")
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {t("send")}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "submitted" && (
          <div className="text-center py-4">
            <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
              <Check className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="text-sm text-gray-600">{t("thankYouMessage")}</p>
          </div>
        )}
      </div>
    </div>
  )
}
