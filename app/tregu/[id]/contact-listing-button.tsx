"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { User } from "@supabase/supabase-js"

interface Listing {
  id: string
  titulli: string
  users?: {
    emri_i_plotë: string
    email: string
  }
  organizations?: {
    emri: string
    email_kontakti: string
  }
}

interface ContactListingButtonProps {
  listing: Listing
  user: User | null
}

export default function ContactListingButton({ listing, user }: ContactListingButtonProps) {
  const [showContactModal, setShowContactModal] = useState(false)
  const router = useRouter()

  return (
    <>
      <Button
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
        onClick={() => {
          if (user) {
            setShowContactModal(true)
          } else {
            router.push("/auth/kycu?message=Ju duhet të kyçeni për të kontaktuar shitësin")
          }
        }}
      >
        Kontakto
      </Button>

      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Informacione Kontakti</h3>
            {listing.organizations ? (
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Organizata:</span>
                  <p className="text-lg">{listing.organizations.emri}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  {user ? (
                    <p className="text-lg text-emerald-600">{listing.organizations.email_kontakti}</p>
                  ) : (
                    <p className="italic text-gray-400">Kyçu për ta parë emailin</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Emri:</span>
                  <p className="text-lg">{listing.users?.emri_i_plotë || "Anonim"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  {user ? (
                    <p className="text-lg text-emerald-600">{listing.users?.email}</p>
                  ) : (
                    <p className="italic text-gray-400">Kyçu për ta parë emailin</p>
                  )}
                </div>
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowContactModal(false)} className="flex-1">
                Mbyll
              </Button>
              <Button
                onClick={() => {
                  const email = listing.organizations?.email_kontakti || listing.users?.email;
                  if (email) {
                    window.location.href = `mailto:${email}?subject=Interesim për: ${listing.titulli}`;
                  }
                }}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                Dërgo Email
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
