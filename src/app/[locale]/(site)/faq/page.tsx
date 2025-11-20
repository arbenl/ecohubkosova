import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react"
import { LocaleWarningBanner } from "@/components/shared/locale-warning-banner"

export default function FAQPage() {
  return (
    <>
      <div className="py-12">
        <div className="container px-4 md:px-6 max-w-4xl">
          <LocaleWarningBanner />
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tighter mb-4">
              Pyetje të <span className="text-emerald-600">Shpeshta</span>
            </h1>
            <p className="text-xl text-gray-600">
              Gjeni përgjigjet për pyetjet më të shpeshta rreth ECO HUB KOSOVA
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <HelpCircle className="h-12 w-12 text-emerald-600 mb-4" />
                <CardTitle>Pyetje të Përgjithshme</CardTitle>
                <CardDescription>
                  Pyetjet më të shpeshta rreth platformës dhe shërbimeve tona
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Çfarë është ECO HUB KOSOVA?</AccordionTrigger>
                    <AccordionContent>
                      ECO HUB KOSOVA është platforma e parë e ekonomisë qarkulluese në Kosovë që
                      lidh organizatat, bizneset dhe individët për të promovuar bashkëpunimin dhe
                      qëndrueshmërinë. Ne ofrojmë një hapësirë digjitale ku partnerët mund të gjejnë
                      njëri-tjetrin, të shkëmbejnë burime dhe të realizojnë projekte të përbashkëta.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Si mund të regjistrohem në platformë?</AccordionTrigger>
                    <AccordionContent>
                      Regjistrimi është i thjeshtë dhe falas. Klikoni butonin "Bashkohu në Rrjet" në
                      faqen kryesore dhe plotësoni formularin e regjistrimit. Nëse jeni individ,
                      profili juaj do të aktivizohet menjëherë. Nëse përfaqësoni një organizatë,
                      profili do të shqyrtohet nga ekipi ynë përpara aktivizimit.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>A është platforma falas për përdorim?</AccordionTrigger>
                    <AccordionContent>
                      Po, ECO HUB KOSOVA është plotësisht falas për të gjithë përdoruesit. Ne
                      besojmë se qasja në informacion dhe mundësitë e bashkëpunimit duhet të jenë të
                      hapura për të gjithë ata që dëshirojnë të kontribuojnë në ekonominë
                      qarkulluese.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger>Kush mund të bëhet anëtar i platformës?</AccordionTrigger>
                    <AccordionContent>
                      Platforma është e hapur për individë, organizata joqeveritare, ndërmarrje
                      sociale, kompani dhe çdo entitet tjetër që është i angazhuar për ekonominë
                      qarkulluese dhe qëndrueshmërinë. Ne mirëpresim të gjithë ata që dëshirojnë të
                      kontribuojnë pozitivisht në mjedisin dhe shoqërinë.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rreth Tregut</CardTitle>
                <CardDescription>Pyetje rreth tregut të ekonomisë qarkulluese</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="market-1">
                    <AccordionTrigger>Si funksionon tregu në platformë?</AccordionTrigger>
                    <AccordionContent>
                      Tregu është një hapësirë ku anëtarët mund të publikojnë listime për materiale,
                      produkte ose shërbime që dëshirojnë të shesin ose të blejnë. Çdo listim
                      shqyrtohet nga ekipi ynë përpara publikimit për të siguruar cilësinë dhe
                      përshtatshmërinë me parimet e ekonomisë qarkulluese.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="market-2">
                    <AccordionTrigger>A ka komisione për transaksionet?</AccordionTrigger>
                    <AccordionContent>
                      Jo, ECO HUB KOSOVA nuk merr komisione për transaksionet që bëhen përmes
                      platformës. Ne vetëm lehtësojmë lidhjen midis blerësve dhe shitësve. Çmimet
                      dhe kushtet e pagesës vendosen drejtpërdrejt midis palëve.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="market-3">
                    <AccordionTrigger>
                      Çfarë lloj materialesh mund të shiten në treg?
                    </AccordionTrigger>
                    <AccordionContent>
                      Në treg mund të shiten materiale të riciklueshme, produkte të qëndrueshme,
                      shërbime mjedisore, pajisje për energji të ripërtëritshme dhe çdo gjë tjetër
                      që kontribuon në ekonominë qarkulluese. Nuk lejohen materiale të dëmshme për
                      mjedisin ose që shkelin ligjet në fuqi.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bashkëpunimi dhe Partneriteti</CardTitle>
                <CardDescription>Pyetje rreth mundësive të bashkëpunimit</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="partnership-1">
                    <AccordionTrigger>Si mund të gjej partnerë për projekte?</AccordionTrigger>
                    <AccordionContent>
                      Mund të përdorni Drejtorinë e Organizatave për të kërkuar partnerë potencialë
                      bazuar në interesat, vendndodhjen dhe llojin e organizatës. Gjithashtu mund të
                      publikoni në treg nëse kërkoni shërbime specifike ose të kontaktoni
                      drejtpërdrejt organizatat që ju interesojnë.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="partnership-2">
                    <AccordionTrigger>A ofron platforma mbështetje për projekte?</AccordionTrigger>
                    <AccordionContent>
                      Po, ne ofrojmë mbështetje në forma të ndryshme: konsulencë për zhvillimin e
                      projekteve, lidhje me financuesit potencialë, promovim përmes kanaleve tona të
                      komunikimit dhe qasje në rrjetin tonë të ekspertëve. Kontaktoni ekipin tonë
                      për më shumë detaje.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="partnership-3">
                    <AccordionTrigger>
                      Si mund të organizoj një event përmes platformës?
                    </AccordionTrigger>
                    <AccordionContent>
                      Anëtarët mund të propozojnë evente që janë në përputhje me misionin tonë.
                      Dërgoni një propozim te ekipi ynë me detajet e eventit, objektivat dhe grupin
                      e synuar. Ne do të ndihmojmë në promovimin dhe organizimin e eventeve që
                      kontribuojnë në ekonominë qarkulluese.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mbështetje Teknike</CardTitle>
                <CardDescription>Pyetje rreth përdorimit të platformës</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="tech-1">
                    <AccordionTrigger>
                      Kam harruar fjalëkalimin, si mund ta rikuperoj?
                    </AccordionTrigger>
                    <AccordionContent>
                      Për çështje të sigurisë, ne nuk ofrojmë opsionin e rikuperimit automatik të
                      fjalëkalimit. Ju lutemi kontaktoni ekipin tonë të mbështetjes në
                      info@ecohubkosova.com dhe ne do t'ju ndihmojmë të rivendosni qasjen në
                      llogarinë tuaj.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="tech-2">
                    <AccordionTrigger>Si mund të përditësoj profilin tim?</AccordionTrigger>
                    <AccordionContent>
                      Pas kyçjes në platformë, shkoni te "Profili im" në menunë e dashboardit. Atje
                      mund të përditësoni të gjitha informacionet tuaja personale dhe të
                      organizatës. Ndryshimet do të ruhen automatikisht.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="tech-3">
                    <AccordionTrigger>A është platforma e sigurt për përdorim?</AccordionTrigger>
                    <AccordionContent>
                      Po, ne përdorim teknologjitë më të fundit të sigurisë për të mbrojtur të
                      dhënat tuaja. Të gjitha komunikimet janë të enkriptuara dhe ne ndjekme
                      praktikat më të mira të sigurisë së të dhënave. Gjithashtu, ne nuk ndajmë
                      informacionet tuaja personale me palë të treta.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="tech-4">
                    <AccordionTrigger>Si mund të fshij llogarinë time?</AccordionTrigger>
                    <AccordionContent>
                      Nëse dëshironi të fshini llogarinë tuaj, ju lutemi kontaktoni ekipin tonë të
                      mbështetjes. Ne do të procesojmë kërkesën tuaj dhe do të fshijmë të gjitha të
                      dhënat personale në përputhje me politikën tonë të privatësisë.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
