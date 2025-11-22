import { getTranslations } from "next-intl/server"

export default async function MarketplaceDetailNotFound() {
    const t = await getTranslations("marketplace-v2")

    return (
        <main className="flex-1 py-12">
            <div className="container px-4 md:px-6 max-w-4xl mx-auto">
                <div className="rounded-xl border border-green-200 bg-green-50/70 p-8 text-center">
                    <h1 className="text-2xl font-semibold text-green-900 mb-3">
                        {t("detail.notFoundTitle")}
                    </h1>
                    <p className="text-muted-foreground">{t("detail.notFoundDescription")}</p>
                </div>
            </div>
        </main>
    )
}
