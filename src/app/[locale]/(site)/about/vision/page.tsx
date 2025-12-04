import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function KushJemiPage() {
  return (
    <>
      <div className="py-12">
        <div className="container px-4 md:px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tighter mb-4">
              Kush <span className="text-emerald-600">Jemi Ne</span>
            </h1>
            <p className="text-xl text-gray-600">
              Njihuni me historinë, vlerat dhe njerëzit pas ECO HUB KOSOVA
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Historia Jonë</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  ECO HUB KOSOVA u themelua në vitin 2024 si përgjigje ndaj nevojës së ngutshme për
                  një platformë që të lehtësojë tranzicionin drejt ekonomisë qarkore në Kosovë.
                  Ideja lindi nga një grup ekspertësh mjedisore, liderësh të biznesit dhe
                  aktivistësh socialë që panë potencialin e madh të vendit tonë për të adoptuar
                  praktikat e qëndrueshme.
                </p>
                <p>
                  Pas muajsh hulumtimi dhe konsultimesh me palët e interesit, ne krijuam një
                  platformë që jo vetëm që lidh organizatat dhe individët, por gjithashtu ofron
                  mjetet e nevojshme për të realizuar projekte konkrete të ekonomisë qarkore.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Qëllimi Ynë</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Ne besojmë se Kosova ka potencialin të bëhet lider rajonal në ekonominë qarkore.
                  Qëllimi ynë është të krijojmë një ekosistem ku:
                </p>
                <ul>
                  <li>
                    Organizatat mund të gjejnë partnerë të përshtatshëm për projekte të përbashkëta
                  </li>
                  <li>Bizneset mund të shkëmbejnë burime dhe të reduktojnë mbetjet</li>
                  <li>Individët mund të kontribuojnë në një ekonomi më të qëndrueshme</li>
                  <li>Njohuritë dhe ekspertiza ndahen lirshëm për të përshpejtuar inovacionin</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vlerat që na Udhëheqin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-emerald-600 mb-2">Qëndrueshmëria</h3>
                    <p className="text-sm text-gray-600">
                      Çdo vendim që marrim vlerëson impaktin afatgjatë në mjedis dhe shoqëri.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-600 mb-2">Inkluziviteti</h3>
                    <p className="text-sm text-gray-600">
                      Platforma jonë është e hapur për të gjithë, pavarësisht madhësisë apo
                      sektorit.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-600 mb-2">Transparenca</h3>
                    <p className="text-sm text-gray-600">
                      Operojmë me transparencë të plotë dhe raportojmë rregullisht për progresin
                      tonë.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-600 mb-2">Inovacioni</h3>
                    <p className="text-sm text-gray-600">
                      Mbështesim zgjidhjet kreative dhe teknologjitë e reja për sfidat mjedisore.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impakti Ynë</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-emerald-600 mb-2">50+</div>
                    <div className="text-sm text-gray-600">Organizata të lidhura</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-emerald-600 mb-2">25</div>
                    <div className="text-sm text-gray-600">Projekte të mbështetura</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-emerald-600 mb-2">100+</div>
                    <div className="text-sm text-gray-600">Ton materiale të ricikluara</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
