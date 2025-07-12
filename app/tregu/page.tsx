"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useSupabase } from "@/lib/auth-provider"
import { useAuth } from "@/lib/auth-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Search, Plus, MapPin, Package, Euro, Building, User } from "lucide-react"

interface Listing {
  id: string
  titulli: string
  pershkrimi: string
  kategori: string
  çmimi: number
  njesia: string
  vendndodhja: string
  sasia: string
  lloji_listimit: "shes" | "blej"
  created_at: string
  users?: {
    emri_i_plotë: string
  }
  organizations?: {
    emri: string
  }
}

export default function TreguPage() {
  const searchParams = useSearchParams()
  const initialTab =
    searchParams.get("lloji") === "blej" ? "blej" : searchParams.get("lloji") === "shes" ? "shes" : "te-gjitha"

  const [activeTab, setActiveTab] = useState(initialTab)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const itemsPerPage = 9

  const supabase = useSupabase()
  const { user } = useAuth()

  const fetchListings = async (reset = false) => {
    if (reset) {
      setPage(1)
      setListings([])
    }

    setLoading(true)

    try {
      let query = supabase
        .from("tregu_listime")
        .select(`
          *,
          users (emri_i_plotë),
          organizations (emri)
        `)
        .eq("eshte_aprovuar", true)
        .order("created_at", { ascending: false })
        .range(reset ? 0 : (page - 1) * itemsPerPage, reset ? itemsPerPage - 1 : page * itemsPerPage - 1)

      if (activeTab !== "te-gjitha") {
        query = query.eq("lloji_listimit", activeTab)
      }

      if (searchQuery) {
        query = query.ilike("titulli", `%${searchQuery}%`)
      }

      if (selectedCategory) {
        query = query.eq("kategori", selectedCategory)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      if (data) {
        if (reset) {
          setListings(data)
        } else {
          setListings([...listings, ...data])
        }
        setHasMore(data.length === itemsPerPage)
      }
    } catch (error) {
      console.error("Gabim gjatë ngarkimit të listimeve:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchListings(true)
  }, [activeTab, searchQuery, selectedCategory])

  const handleLoadMore = () => {
    setPage(page + 1)
    fetchListings()
  }

  const categories = [
    "Materiale të riciklueshme",
    "Produkte të qëndrueshme",
    "Shërbime",
    "Energji e ripërtëritshme",
    "Ushqim dhe bujqësi",
    "Tekstile",
    "Elektronikë",
    "Tjera",
  ]

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-white">
      <Header />
      <main className="flex-1 py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-12 animate-fade-in">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                Tregu i Ekonomisë Qarkulluese
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Zbulo mundësitë e tregut për materiale, produkte dhe shërbime të qëndrueshme
              </p>
            </div>
            {user && (
              <Button
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-2xl px-6 py-3 font-semibold transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/tregu/shto">
                  <Plus className="mr-2 h-5 w-5" /> Shto listim të ri
                </Link>
              </Button>
            )}
          </div>

          <div className="animate-slide-up">
            <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value)} className="space-y-8">
              <TabsList className="glass-card p-2 rounded-2xl">
                <TabsTrigger value="te-gjitha" className="rounded-xl px-6 py-3 font-medium">
                  Të gjitha
                </TabsTrigger>
                <TabsTrigger value="shes" className="rounded-xl px-6 py-3 font-medium">
                  Për Shitje
                </TabsTrigger>
                <TabsTrigger value="blej" className="rounded-xl px-6 py-3 font-medium">
                  Kërkoj të Blej
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    placeholder="Kërko sipas titullit..."
                    className="pl-12 h-12 rounded-2xl border-gray-200 focus:border-orange-500 focus:ring-[#00C896]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-[250px] h-12 rounded-2xl border-gray-200">
                    <SelectValue placeholder="Kategoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Të gjitha kategoritë</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <TabsContent value="te-gjitha" className="mt-0">
                {listings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {listings.map((listing, index) => (
                      <Card
                        key={listing.id}
                        className={`glass-card rounded-2xl hover-lift overflow-hidden border-0 animate-slide-up`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex justify-between items-start mb-3">
                            <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2">
                              {listing.titulli}
                            </CardTitle>
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                listing.lloji_listimit === "shes"
                                  ? "bg-gradient-to-r from-[#00C896] to-[#00A07E] text-white"
                                  : "bg-gradient-to-r from-[#10D9A8] to-[#00A07E] text-white"
                              }`}
                            >
                              {listing.lloji_listimit === "shes" ? "Për Shitje" : "Kërkoj të Blej"}
                            </div>
                          </div>
                          <CardDescription className="line-clamp-3 text-gray-600 leading-relaxed">
                            {listing.pershkrimi}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="pb-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-500" />
                              <div>
                                <span className="font-medium text-gray-700">Kategoria:</span>
                                <p className="text-gray-600">{listing.kategori}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <div>
                                <span className="font-medium text-gray-700">Vendndodhja:</span>
                                <p className="text-gray-600">{listing.vendndodhja}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-500" />
                              <div>
                                <span className="font-medium text-gray-700">Sasia:</span>
                                <p className="text-gray-600">{listing.sasia}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Euro className="h-4 w-4 text-gray-500" />
                              <div>
                                <span className="font-medium text-gray-700">Çmimi:</span>
                                <p className="text-orange-600 font-semibold">
                                  {listing.çmimi} € / {listing.njesia}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>

                        <CardFooter className="pt-4 flex justify-between items-center border-t border-gray-100">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {listing.organizations ? (
                              <>
                                <Building className="h-3 w-3" />
                                <span>{listing.organizations.emri}</span>
                              </>
                            ) : (
                              <>
                                <User className="h-3 w-3" />
                                <span>{listing.users?.emri_i_plotë || "Anonim"}</span>
                              </>
                            )}
                          </div>
                          <Button size="sm" asChild className="rounded-xl">
                            <Link href={`/tregu/${listing.id}`}>Shiko detajet</Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    {loading ? (
                      <div className="space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C896] mx-auto"></div>
                        <p className="text-gray-600">Duke ngarkuar...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-6">
                        <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center">
                          <ShoppingCart className="h-12 w-12 text-gray-400" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold text-gray-900">Nuk u gjetën rezultate</h3>
                          <p className="text-gray-500">Provoni të ndryshoni filtrat ose të shtoni një listim të ri</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {hasMore && listings.length > 0 && (
                  <div className="flex justify-center mt-12">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="rounded-2xl px-8 py-3 border-2 hover:border-orange-500 hover:text-orange-600 transition-all duration-300 bg-transparent"
                    >
                      {loading ? "Duke ngarkuar..." : "Ngarko më shumë"}
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="shes" className="mt-0">
                {listings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {listings.map((listing, index) => (
                      <Card
                        key={listing.id}
                        className={`glass-card rounded-2xl hover-lift overflow-hidden border-0 animate-slide-up`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex justify-between items-start mb-3">
                            <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2">
                              {listing.titulli}
                            </CardTitle>
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                listing.lloji_listimit === "shes"
                                  ? "bg-gradient-to-r from-[#00C896] to-[#00A07E] text-white"
                                  : "bg-gradient-to-r from-[#10D9A8] to-[#00A07E] text-white"
                              }`}
                            >
                              {listing.lloji_listimit === "shes" ? "Për Shitje" : "Kërkoj të Blej"}
                            </div>
                          </div>
                          <CardDescription className="line-clamp-3 text-gray-600 leading-relaxed">
                            {listing.pershkrimi}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="pb-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-500" />
                              <div>
                                <span className="font-medium text-gray-700">Kategoria:</span>
                                <p className="text-gray-600">{listing.kategori}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <div>
                                <span className="font-medium text-gray-700">Vendndodhja:</span>
                                <p className="text-gray-600">{listing.vendndodhja}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-500" />
                              <div>
                                <span className="font-medium text-gray-700">Sasia:</span>
                                <p className="text-gray-600">{listing.sasia}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Euro className="h-4 w-4 text-gray-500" />
                              <div>
                                <span className="font-medium text-gray-700">Çmimi:</span>
                                <p className="text-orange-600 font-semibold">
                                  {listing.çmimi} € / {listing.njesia}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>

                        <CardFooter className="pt-4 flex justify-between items-center border-t border-gray-100">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {listing.organizations ? (
                              <>
                                <Building className="h-3 w-3" />
                                <span>{listing.organizations.emri}</span>
                              </>
                            ) : (
                              <>
                                <User className="h-3 w-3" />
                                <span>{listing.users?.emri_i_plotë || "Anonim"}</span>
                              </>
                            )}
                          </div>
                          <Button size="sm" asChild className="rounded-xl">
                            <Link href={`/tregu/${listing.id}`}>Shiko detajet</Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    {loading ? (
                      <div className="space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C896] mx-auto"></div>
                        <p className="text-gray-600">Duke ngarkuar...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-6">
                        <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center">
                          <ShoppingCart className="h-12 w-12 text-gray-400" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold text-gray-900">Nuk u gjetën rezultate</h3>
                          <p className="text-gray-500">Provoni të ndryshoni filtrat ose të shtoni një listim të ri</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {hasMore && listings.length > 0 && (
                  <div className="flex justify-center mt-12">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="rounded-2xl px-8 py-3 border-2 hover:border-orange-500 hover:text-orange-600 transition-all duration-300 bg-transparent"
                    >
                      {loading ? "Duke ngarkuar..." : "Ngarko më shumë"}
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="blej" className="mt-0">
                {listings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {listings.map((listing, index) => (
                      <Card
                        key={listing.id}
                        className={`glass-card rounded-2xl hover-lift overflow-hidden border-0 animate-slide-up`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex justify-between items-start mb-3">
                            <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2">
                              {listing.titulli}
                            </CardTitle>
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                listing.lloji_listimit === "shes"
                                  ? "bg-gradient-to-r from-[#00C896] to-[#00A07E] text-white"
                                  : "bg-gradient-to-r from-[#10D9A8] to-[#00A07E] text-white"
                              }`}
                            >
                              {listing.lloji_listimit === "shes" ? "Për Shitje" : "Kërkoj të Blej"}
                            </div>
                          </div>
                          <CardDescription className="line-clamp-3 text-gray-600 leading-relaxed">
                            {listing.pershkrimi}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="pb-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-500" />
                              <div>
                                <span className="font-medium text-gray-700">Kategoria:</span>
                                <p className="text-gray-600">{listing.kategori}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <div>
                                <span className="font-medium text-gray-700">Vendndodhja:</span>
                                <p className="text-gray-600">{listing.vendndodhja}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-500" />
                              <div>
                                <span className="font-medium text-gray-700">Sasia:</span>
                                <p className="text-gray-600">{listing.sasia}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Euro className="h-4 w-4 text-gray-500" />
                              <div>
                                <span className="font-medium text-gray-700">Çmimi:</span>
                                <p className="text-orange-600 font-semibold">
                                  {listing.çmimi} € / {listing.njesia}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>

                        <CardFooter className="pt-4 flex justify-between items-center border-t border-gray-100">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {listing.organizations ? (
                              <>
                                <Building className="h-3 w-3" />
                                <span>{listing.organizations.emri}</span>
                              </>
                            ) : (
                              <>
                                <User className="h-3 w-3" />
                                <span>{listing.users?.emri_i_plotë || "Anonim"}</span>
                              </>
                            )}
                          </div>
                          <Button size="sm" asChild className="rounded-xl">
                            <Link href={`/tregu/${listing.id}`}>Shiko detajet</Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    {loading ? (
                      <div className="space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C896] mx-auto"></div>
                        <p className="text-gray-600">Duke ngarkuar...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-6">
                        <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center">
                          <ShoppingCart className="h-12 w-12 text-gray-400" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold text-gray-900">Nuk u gjetën rezultate</h3>
                          <p className="text-gray-500">Provoni të ndryshoni filtrat ose të shtoni një listim të ri</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {hasMore && listings.length > 0 && (
                  <div className="flex justify-center mt-12">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="rounded-2xl px-8 py-3 border-2 hover:border-orange-500 hover:text-orange-600 transition-all duration-300 bg-transparent"
                    >
                      {loading ? "Duke ngarkuar..." : "Ngarko më shumë"}
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
