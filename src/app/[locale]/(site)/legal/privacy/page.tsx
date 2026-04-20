import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const content = {
  sq: {
    title: "Politika e Privatësisë",
    subtitle: "Si i mbledhim, përdorim dhe mbrojmë të dhënat tuaja në ECO HUB KOSOVA",
    updated: "Përditësuar më: 20 Prill 2026",
    sections: [
      {
        title: "1. Të dhënat që mbledhim",
        body: [
          "Kur krijoni llogari ose profil organizate, ne mbledhim të dhëna si emri, emaili, vendndodhja, roli, të dhënat e organizatës dhe preferencat e komunikimit.",
          "Kur publikoni listime ose ndërveproni me tregun, mund të ruajmë informacionin e listimit, kategoritë, kontaktet e lidhura dhe aktivitetet bazë të platformës.",
        ],
      },
      {
        title: "2. Si i përdorim të dhënat",
        body: [
          "Të dhënat përdoren për të krijuar dhe menaxhuar llogarinë tuaj, për të shfaqur listime dhe organizata, për të mundësuar kontaktin mes përdoruesve dhe për të përmirësuar sigurinë e platformës.",
          "Nëse regjistroheni si organizatë, të dhënat tuaja mund të shqyrtohen nga administratorët para aktivizimit të plotë të profilit.",
        ],
      },
      {
        title: "3. Ruajtja dhe siguria",
        body: [
          "Ne përdorim masa teknike dhe organizative për të mbrojtur të dhënat nga qasja e paautorizuar, humbja ose keqpërdorimi.",
          "Qasja në të dhëna kufizohet vetëm për funksionet e nevojshme të platformës dhe administrimin e shërbimit.",
        ],
      },
      {
        title: "4. Zgjedhjet tuaja",
        body: [
          "Mund të përditësoni të dhënat e profilit nga hapësira juaj e përdoruesit.",
          "Për kërkesa për korrigjim, eksportim ose fshirje të të dhënave, kontaktoni ekipin në info@ecohubkosova.com.",
        ],
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    subtitle: "How we collect, use, and protect your data on ECO HUB KOSOVA",
    updated: "Updated: April 20, 2026",
    sections: [
      {
        title: "1. Data we collect",
        body: [
          "When you create an account or organization profile, we collect data such as name, email, location, role, organization details, and communication preferences.",
          "When you publish listings or interact with the marketplace, we may store listing information, categories, related contact details, and basic platform activity.",
        ],
      },
      {
        title: "2. How we use data",
        body: [
          "Data is used to create and manage your account, display listings and organizations, enable contact between users, and improve platform security.",
          "If you register as an organization, your data may be reviewed by administrators before the profile is fully activated.",
        ],
      },
      {
        title: "3. Storage and security",
        body: [
          "We use technical and organizational measures to protect data from unauthorized access, loss, or misuse.",
          "Data access is limited to the platform functions and service administration that require it.",
        ],
      },
      {
        title: "4. Your choices",
        body: [
          "You can update profile details from your user workspace.",
          "For requests to correct, export, or delete data, contact the team at info@ecohubkosova.com.",
        ],
      },
    ],
  },
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const copy = locale === "en" ? content.en : content.sq

  return (
    <div className="py-12">
      <div className="container px-4 md:px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tighter mb-4">{copy.title}</h1>
          <p className="text-xl text-gray-600">{copy.subtitle}</p>
          <p className="text-sm text-gray-500 mt-2">{copy.updated}</p>
        </div>

        <div className="space-y-8">
          {copy.sections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
