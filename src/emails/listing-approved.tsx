import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components"
import * as React from "react"

interface ListingApprovedEmailProps {
  userName?: string
  listingTitle?: string
  listingUrl?: string // e.g. https://ecohub.org/marketplace/list-id
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL
  : "https://ecohub-kosova.com"

export const ListingApprovedEmail = ({
  userName = "Përdorues",
  listingTitle = "Tavolina",
  listingUrl = `${baseUrl}/marketplace`,
}: ListingApprovedEmailProps) => {
  const previewText = `Listimi juaj "${listingTitle}" u aprovua!`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={`${baseUrl}/static/logo.png`}
                width="120"
                height="35"
                alt="EcoHub Kosova"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Listimi u Aprovua!
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">Përshëndetje {userName},</Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Kemi kënaqësinë t'ju njoftojmë se listimi juaj <strong>{listingTitle}</strong> është
              shqyrtuar dhe aprovuar nga ekipi ynë.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Tani listimi është publik dhe i dukshëm për të gjithë përdoruesit në platformën EcoHub
              Kosova.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-emerald-600 rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={listingUrl}
              >
                Shiko Listimin
              </Button>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Ky është një njoftim automatik. Ju lutem mos ktheni përgjigje në këtë email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default ListingApprovedEmail
