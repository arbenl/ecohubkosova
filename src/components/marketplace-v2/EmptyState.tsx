"use client"

import { Leaf, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmptyStateProps {
    locale: string
    user?: any
}

export function EmptyState({ locale, user }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="rounded-full bg-green-50 p-6 mb-6">
                <Leaf className="h-16 w-16 text-green-600" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {locale === "sq"
                    ? "Asnjë ofertë aktualisht"
                    : "No listings yet"}
            </h3>

            <p className="text-muted-foreground text-center max-w-md mb-6">
                {locale === "sq"
                    ? "Bëhu i pari që ofron materiale, produkte ose shërbime në ekonominë qarkulluese."
                    : "Be the first to offer materials, products, or services in the circular economy."}
            </p>

            {user && (
                <Button
                    asChild
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                    <Link href={`/${locale}/marketplace/add`}>
                        <Plus className="mr-2 h-4 w-4" />
                        {locale === "sq" ? "Shto Ofertë" : "Create Listing"}
                    </Link>
                </Button>
            )}
        </div>
    )
}
