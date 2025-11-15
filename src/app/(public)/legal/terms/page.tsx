import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function KushtetEPerdorimitPage() {
  return (
    <>
      <div className="py-12">
        <div className="container px-4 md:px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tighter mb-4">
              Kushtet e <span className="text-emerald-600">Përdorimit</span>
            </h1>
            <p className="text-xl text-gray-600">Kushtet dhe rregullat për përdorimin e platformës ECO HUB KOSOVA</p>
            <p className="text-sm text-gray-500 mt-2">Përditësuar më: 15 Dhjetor 2024</p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Pranimi i Kushteve</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Duke përdorur platformën ECO HUB KOSOVA ("Platforma"), ju pranoni të jeni të lidhur nga këto Kushte të
                  Përdorimit. Nëse nuk pajtoheni me këto kushte, ju lutemi mos e përdorni Platformën.
                </p>
                <p>
                  Ne rezervojmë të drejtën të ndryshojmë këto kushte në çdo kohë. Ndryshimet do të hyjnë në fuqi
                  menjëherë pas publikimit në Platformë. Përdorimi i vazhdueshëm i Platformës pas ndryshimeve
                  konsiderohet si pranim i kushteve të reja.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Përshkrimi i Shërbimit</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  ECO HUB KOSOVA është një platformë digjitale që lehtëson bashkëpunimin midis organizatave, bizneseve
                  dhe individëve në fushën e ekonomisë qarkulluese në Kosovë. Platforma ofron:
                </p>
                <ul>
                  <li>Drejtori të organizatave dhe bizneseve</li>
                  <li>Treg për shkëmbimin e materialeve dhe shërbimeve</li>
                  <li>Qendër dijes me artikuj dhe burime edukative</li>
                  <li>Mjete për komunikim dhe bashkëpunim</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Regjistrimi dhe Llogaritë e Përdoruesve</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Për të përdorur disa funksione të Platformës, ju duhet të krijoni një llogari. Ju jeni përgjegjës për:
                </p>
                <ul>
                  <li>Sigurimin e saktësisë së informacioneve që jepni</li>
                  <li>Mbajtjen e sigurisë së kredencialeve tuaja të kyçjes</li>
                  <li>Të gjitha aktivitetet që ndodhin nën llogarinë tuaj</li>
                  <li>Njoftimin e menjëhershëm për çdo përdorim të paautorizuar</li>
                </ul>
                <p>
                  Ne rezervojmë të drejtën të refuzojmë regjistrimin ose të pezullojmë llogaritë që shkelin këto kushte.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Përdorimi i Pranueshëm</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>Ju pajtoheni të mos përdorni Platformën për:</p>
                <ul>
                  <li>Aktivitete të paligjshme ose që shkelin të drejtat e të tjerëve</li>
                  <li>Publikimin e përmbajtjes së rreme, mashtrues ose të dëmshme</li>
                  <li>Spam, reklamim të paautorizuar ose komunikime të padëshiruara</li>
                  <li>Përpjekje për të kompromentuar sigurinë e Platformës</li>
                  <li>Shkelje të të drejtave të pronësisë intelektuale</li>
                  <li>Diskriminim, ngacmim ose sjellje të papërshtatshme</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Përmbajtja e Përdoruesve</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Ju mbani të drejtat e pronësisë për përmbajtjen që publikoni në Platformë, por na jep një kopje të
                  tëra të drejtave të pronësisë intelektuale për të gjithë përmbajtjen që publikoni në Platformë.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
