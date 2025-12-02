"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react"

export default function FAQPage() {
  const t = useTranslations("faq")

  return (
    <div className="py-12">
      <div className="container px-4 md:px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tighter mb-4">{t("title")}</h1>
          <p className="text-xl text-gray-600">{t("subtitle")}</p>
        </div>

        <div className="space-y-8">
          {/* General Questions */}
          <Card>
            <CardHeader>
              <HelpCircle className="h-12 w-12 text-emerald-600 mb-4" />
              <CardTitle>{t("sections.general.title")}</CardTitle>
              <CardDescription>{t("sections.general.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    {t("sections.general.questions.whatIsEcoHub.question")}
                  </AccordionTrigger>
                  <AccordionContent>
                    {t("sections.general.questions.whatIsEcoHub.answer")}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    {t("sections.general.questions.howToRegister.question")}
                  </AccordionTrigger>
                  <AccordionContent>
                    {t("sections.general.questions.howToRegister.answer")}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    {t("sections.general.questions.isFree.question")}
                  </AccordionTrigger>
                  <AccordionContent>
                    {t("sections.general.questions.isFree.answer")}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    {t("sections.general.questions.whoCanJoin.question")}
                  </AccordionTrigger>
                  <AccordionContent>
                    {t("sections.general.questions.whoCanJoin.answer")}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Marketplace Questions */}
          <Card>
            <CardHeader>
              <CardTitle>{t("sections.marketplace.title")}</CardTitle>
              <CardDescription>{t("sections.marketplace.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="market-1">
                  <AccordionTrigger>
                    {t("sections.marketplace.questions.howMarketplaceWorks.question")}
                  </AccordionTrigger>
                  <AccordionContent>
                    {t("sections.marketplace.questions.howMarketplaceWorks.answer")}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="market-2">
                  <AccordionTrigger>
                    {t("sections.marketplace.questions.transactionFees.question")}
                  </AccordionTrigger>
                  <AccordionContent>
                    {t("sections.marketplace.questions.transactionFees.answer")}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="market-3">
                  <AccordionTrigger>
                    {t("sections.marketplace.questions.whatCanBeSold.question")}
                  </AccordionTrigger>
                  <AccordionContent>
                    {t("sections.marketplace.questions.whatCanBeSold.answer")}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Partnership Questions */}
          <Card>
            <CardHeader>
              <CardTitle>{t("sections.partnership.title")}</CardTitle>
              <CardDescription>{t("sections.partnership.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="partnership-1">
                  <AccordionTrigger>
                    {t("sections.partnership.questions.findPartners.question")}
                  </AccordionTrigger>
                  <AccordionContent>
                    {t("sections.partnership.questions.findPartners.answer")}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="partnership-2">
                  <AccordionTrigger>
                    {t("sections.partnership.questions.projectSupport.question")}
                  </AccordionTrigger>
                  <AccordionContent>
                    {t("sections.partnership.questions.projectSupport.answer")}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="partnership-3">
                  <AccordionTrigger>
                    {t("sections.partnership.questions.organizeEvent.question")}
                  </AccordionTrigger>
                  <AccordionContent>
                    {t("sections.partnership.questions.organizeEvent.answer")}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Technical Support Questions */}
          <Card>
            <CardHeader>
              <CardTitle>{t("sections.technical.title")}</CardTitle>
              <CardDescription>{t("sections.technical.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="tech-1">
                  <AccordionTrigger>
                    {t("sections.technical.questions.forgotPassword.question")}
                  </AccordionTrigger>
                  <AccordionContent>
                    {t("sections.technical.questions.forgotPassword.answer")}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="tech-2">
                  <AccordionTrigger>
                    {t("sections.technical.questions.updateProfile.question")}
                  </AccordionTrigger>
                  <AccordionContent>
                    {t("sections.technical.questions.updateProfile.answer")}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="tech-3">
                  <AccordionTrigger>
                    {t("sections.technical.questions.isSafe.question")}
                  </AccordionTrigger>
                  <AccordionContent>
                    {t("sections.technical.questions.isSafe.answer")}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="tech-4">
                  <AccordionTrigger>
                    {t("sections.technical.questions.deleteAccount.question")}
                  </AccordionTrigger>
                  <AccordionContent>
                    {t("sections.technical.questions.deleteAccount.answer")}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
