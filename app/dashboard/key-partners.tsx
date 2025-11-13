import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function KeyPartners({ keyPartners }: { keyPartners: any[] }) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-gray-900">Partnerët kryesorë</CardTitle>
        <CardDescription>Organizatat aktive në rrjetin tonë</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {keyPartners && keyPartners.length > 0 ? (
          <>
            {keyPartners.map((partner: any) => (
              <div key={partner.id} className="border-b pb-4 last:border-0 last:pb-0">
                <h3 className="font-medium text-gray-900 line-clamp-1">{partner.emri}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {partner.lloji} • {partner.vendndodhja}
                </p>
                <div className="flex justify-end mt-2">
                  <Button variant="ghost" size="sm" className="text-emerald-600 rounded-lg" asChild>
                    <Link href={`/drejtoria/${partner.id}`}>
                      Shiko <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full rounded-xl bg-transparent" asChild>
                <Link href="/drejtoria">Shiko të gjithë partnerët</Link>
              </Button>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center py-8">Nuk ka partnerë të disponueshëm aktualisht.</p>
        )}
      </CardContent>
    </Card>
  )
}
