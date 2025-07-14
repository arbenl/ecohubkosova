"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useSupabase, useAuth } from "@/lib/auth-provider";

type UserRole = "Individ" | "OJQ" | "Ndërmarrje Sociale" | "Kompani";

interface FormData {
  emri_i_plotë: string;
  email: string;
  password: string;
  confirmPassword: string;
  vendndodhja: string;
  roli: UserRole;
  emri_organizates?: string;
  pershkrimi_organizates?: string;
  interesi_primar?: string;
  person_kontakti?: string;
  email_kontakti?: string;
  terms: boolean;
  newsletter: boolean;
}

export default function RegjistrohuPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = useSupabase();
  const { user, isLoading } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    emri_i_plotë: "",
    email: "",
    password: "",
    confirmPassword: "",
    vendndodhja: "",
    roli: "Individ",
    emri_organizates: "",
    pershkrimi_organizates: "",
    interesi_primar: "",
    person_kontakti: "",
    email_kontakti: "",
    terms: false,
    newsletter: false,
  });

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleRoleChange = (value: UserRole) => {
    setFormData({ ...formData, roli: value });
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (
        !formData.emri_i_plotë ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword ||
        !formData.vendndodhja
      ) {
        setError("Ju lutemi plotësoni të gjitha fushat e detyrueshme.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Fjalëkalimet nuk përputhen.");
        return;
      }
      if (formData.password.length < 6) {
        setError("Fjalëkalimi duhet të ketë të paktën 6 karaktere.");
        return;
      }
    }
    if (step === 2 && formData.roli !== "Individ") {
      if (
        !formData.emri_organizates ||
        !formData.pershkrimi_organizates ||
        !formData.interesi_primar
      ) {
        setError("Ju lutemi plotësoni të gjitha fushat e organizatës.");
        return;
      }
    }
    setError(null);
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.terms) {
      setError("Ju duhet të pranoni kushtet e përdo...");
    }

    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            emri_i_plotë: formData.emri_i_plotë,
            roli: formData.roli,
          },
        },
      });

      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error("Regjistrimi dështoi. Përpiquni përseri.");

      const { error: profileError } = await supabase.from("users").insert({
        id: user.id,
        emri_i_plotë: formData.emri_i_plotë,
        email: formData.email,
        vendndodhja: formData.vendndodhja,
        roli: formData.roli,
        eshte_aprovuar: formData.roli === "Individ",
      });

      if (profileError) throw profileError;

      if (formData.roli !== "Individ") {
        const { data: orgData, error: orgError } = await supabase
          .from("organizations")
          .insert({
            emri: formData.emri_organizates!,
            pershkrimi: formData.pershkrimi_organizates!,
            interesi_primar: formData.interesi_primar!,
            person_kontakti: formData.person_kontakti || formData.emri_i_plotë,
            email_kontakti: formData.email_kontakti || formData.email,
            vendndodhja: formData.vendndodhja,
            lloji: formData.roli,
            eshte_aprovuar: false,
          })
          .select();

        if (orgError) throw orgError;

        if (orgData && orgData[0]) {
          const { error: memberError } = await supabase
            .from("organization_members")
            .insert({
              organization_id: orgData[0].id,
              user_id: user.id,
              roli_ne_organizate: "themelues",
              eshte_aprovuar: true,
            });

          if (memberError) throw memberError;
        }
      }

      router.push("/auth/sukses");
    } catch (error: any) {
      setError(error.message || "Gabim gjetë regjistrimit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00C896]/5 to-[#00A07E]/5 py-12">
      <div className="container px-4 md:px-6 max-w-lg">
        <Card className="glass-card rounded-2xl shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">Bashkohu me ne</CardTitle>
            <CardDescription className="text-gray-600">
              Hapi {step} nga 3 -{" "}
              {step === 1 ? "Informacioni bazë" : step === 2 ? "Detajet e organizatës" : "Kushtet dhe konfirmimi"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="emri_i_plotë" className="text-gray-700 font-medium">
                      Emri i plotë
                    </Label>
                    <Input
                      id="emri_i_plotë"
                      name="emri_i_plotë"
                      value={formData.emri_i_plotë}
                      onChange={handleChange}
                      placeholder="Emri dhe mbiemri"
                      className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="emri@shembull.com"
                      className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      Fjalëkalimi
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                      Konfirmo fjalëkalimin
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vendndodhja" className="text-gray-700 font-medium">
                      Vendndodhja
                    </Label>
                    <Input
                      id="vendndodhja"
                      name="vendndodhja"
                      value={formData.vendndodhja}
                      onChange={handleChange}
                      placeholder="Prishtinë, Kosovë"
                      className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-gray-700 font-medium">Roli</Label>
                    <RadioGroup
                      value={formData.roli}
                      onValueChange={(value) => handleRoleChange(value as UserRole)}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value="Individ" id="individ" />
                        <Label htmlFor="individ" className="flex-1 cursor-pointer">
                          <div className="font-medium">Individ</div>
                          <div className="text-sm text-gray-500">Përdorues individual</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value="OJQ" id="ojq" />
                        <Label htmlFor="ojq" className="flex-1 cursor-pointer">
                          <div className="font-medium">Organizatë Joqeveritare (OJQ)</div>
                          <div className="text-sm text-gray-500">Organizatë pa fitim</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value="Ndërmarrje Sociale" id="ndermarrje" />
                        <Label htmlFor="ndermarrje" className="flex-1 cursor-pointer">
                          <div className="font-medium">Ndërmarrje Sociale</div>
                          <div className="text-sm text-gray-500">Biznes me qëllim social</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value="Kompani" id="kompani" />
                        <Label htmlFor="kompani" className="flex-1 cursor-pointer">
                          <div className="font-medium">Kompani</div>
                          <div className="text-sm text-gray-500">Biznes komercial</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  {formData.roli !== "Individ" ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="emri_organizates" className="text-gray-700 font-medium">
                          Emri i organizatës
                        </Label>
                        <Input
                          id="emri_organizates"
                          name="emri_organizates"
                          value={formData.emri_organizates}
                          onChange={handleChange}
                          placeholder="Emri i organizatës"
                          className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pershkrimi_organizates" className="text-gray-700 font-medium">
                          Përshkrimi i organizatës
                        </Label>
                        <Textarea
                          id="pershkrimi_organizates"
                          name="pershkrimi_organizates"
                          value={formData.pershkrimi_organizates}
                          onChange={handleChange}
                          placeholder="Përshkrim i shkurtër i organizatës"
                          className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="interesi_primar" className="text-gray-700 font-medium">
                          Interesi primar në ekonominë qarkulluese
                        </Label>
                        <Input
                          id="interesi_primar"
                          name="interesi_primar"
                          value={formData.interesi_primar}
                          onChange={handleChange}
                          placeholder="p.sh. Riciklimi, Energjia e ripërtëritshme, etj."
                          className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="person_kontakti" className="text-gray-700 font-medium">
                          Person kontakti (opsionale)
                        </Label>
                        <Input
                          id="person_kontakti"
                          name="person_kontakti"
                          value={formData.person_kontakti}
                          onChange={handleChange}
                          placeholder="Emri i personit të kontaktit"
                          className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email_kontakti" className="text-gray-700 font-medium">
                          Email kontakti (opsionale)
                        </Label>
                        <Input
                          id="email_kontakti"
                          name="email_kontakti"
                          type="email"
                          value={formData.email_kontakti}
                          onChange={handleChange}
                          placeholder="Email i personit të kontaktit"
                          className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full eco-gradient flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Gati për hapin tjetër!</h3>
                      <p className="text-gray-500">Nuk ka informacione shtesë të nevojshme për individët.</p>
                    </div>
                  )}
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-3 p-4 rounded-xl border border-gray-200">
                      <Checkbox
                        id="terms"
                        name="terms"
                        checked={formData.terms}
                        onCheckedChange={(checked) => setFormData({ ...formData, terms: checked as boolean })}
                        required
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="terms" className="text-sm font-medium leading-relaxed cursor-pointer">
                          Pranoj{" "}
                          <Link href="/kushtet-e-perdorimit" className="text-[#00C896] hover:text-[#00A07E] underline">
                            kushtet e përdorimit
                          </Link>{" "}
                          dhe{" "}
                          <Link href="/privatesia" className="text-[#00C896] hover:text-[#00A07E] underline">
                            politikën e privatësisë
                          </Link>
                        </Label>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 rounded-xl border border-gray-200">
                      <Checkbox
                        id="newsletter"
                        name="newsletter"
                        checked={formData.newsletter}
                        onCheckedChange={(checked) => setFormData({ ...formData, newsletter: checked as boolean })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="newsletter" className="text-sm font-medium leading-relaxed cursor-pointer">
                          Dëshiroj të marr njoftime dhe përditësime nga ECO HUB KOSOVA
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          Mund ta ndryshoni këtë preferencë në çdo kohë nga profili juaj.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={loading}
                    className="rounded-xl border-gray-200"
                  >
                    Kthehu
                  </Button>
                )}
                {step < 3 ? (
                  <Button
                    type="button"
                    className="ml-auto eco-gradient hover:shadow-lg hover:shadow-[#00C896]/25 text-white rounded-xl px-8 py-2 font-semibold transition-all duration-300 hover:scale-[1.02]"
                    onClick={handleNextStep}
                  >
                    Vazhdo
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="ml-auto eco-gradient hover:shadow-lg hover:shadow-[#00C896]/25 text-white rounded-xl px-8 py-2 font-semibold transition-all duration-300 hover:scale-[1.02]"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Duke u regjistruar...
                      </div>
                    ) : (
                      "Regjistrohu"
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-600">
              Keni tashmë një llogari?{" "}
              <Link href="/auth/kycu" className="text-[#00C896] hover:text-[#00A07E] font-medium transition-colors">
                Kyçu këtu
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
