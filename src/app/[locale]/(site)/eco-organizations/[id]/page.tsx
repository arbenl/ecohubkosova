import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, MapPin } from "lucide-react"
import { fetchEcoOrganizationById } from "@/services/eco-organizations"

interface PageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function EcoOrganizationDetailPage({ params }: PageProps) {
  const { locale, id } = await params
  const t = await getTranslations("eco-organizations")

  const organization = await fetchEcoOrganizationById(id)

  if (!organization) {
    notFound()
  }

  const {
    organization_name,
    organization_description,
    organization_location,
    organization_email,
    organization_contact_person,
    org_role,
    certifications,
    waste_types_handled,
    service_areas,
  } = organization

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3 text-2xl font-bold text-gray-900">
            <span>{organization_name}</span>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              {t(`roleLabels.${org_role}`)}
            </Badge>
          </CardTitle>
          <p className="text-gray-600">{organization_description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 text-sm text-gray-700">
            {organization_location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{organization_location}</span>
              </div>
            )}
            {organization_email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <a href={`mailto:${organization_email}`} className="text-emerald-700 hover:underline">
                  {organization_email}
                </a>
              </div>
            )}
            {organization_contact_person && (
              <p className="text-sm text-gray-700">
                {t("contactPersonLabel")}: <span className="font-medium">{organization_contact_person}</span>
              </p>
            )}
          </div>

          {waste_types_handled && waste_types_handled.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">{t("cardMainMaterials")}</p>
              <div className="flex flex-wrap gap-2">
                {waste_types_handled.map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {certifications && certifications.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">{t("cardCertifications")}</p>
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert) => (
                  <Badge key={cert} className="bg-blue-50 text-blue-700 border-blue-200">
                    ✓ {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {service_areas && service_areas.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">{t("serviceAreasLabel")}</p>
              <div className="flex flex-wrap gap-2">
                {service_areas.map((area) => (
                  <Badge key={area} variant="secondary">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
