"use client"

import { useState } from "react"
import { useAdminListings, AdminListing } from "@/hooks/use-admin-listings"
import { adminListingUpdateSchema } from "@/validation/admin"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  MoreHorizontal,
  Search,
  CheckCircle2,
  XCircle,
  MapPin,
  Tag,
  Trash2,
  Edit,
  Filter,
  CheckCheck,
} from "lucide-react"
import { toast } from "sonner"

interface ListingsClientPageProps {
  initialListings: AdminListing[]
}

export default function ListingsClientPage({ initialListings }: ListingsClientPageProps) {
  const {
    listings,
    handleDelete,
    handleUpdate,
    handleApprove,
    handleBulkApprove,
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
  } = useAdminListings(initialListings)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [editingListing, setEditingListing] = useState<AdminListing | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [approvedState, setApprovedState] = useState(false)

  // Filter Logic
  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "approved"
          ? item.is_approved
          : !item.is_approved
    const matchesType = typeFilter === "all" ? true : item.listing_type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const pendingCount = filteredListings.filter((l) => !l.is_approved).length

  // Quick Approve
  const onQuickApprove = async (listing: AdminListing) => {
    const toastId = toast.loading("Duke aprovuar listimin...")
    const res = await handleApprove(listing.id)
    if (res?.error) {
      toast.error("Gabim gjatë aprovimit", { id: toastId })
    } else {
      toast.success("Listimi u aprovua!", { id: toastId })
    }
  }

  // Bulk Approve
  const onBulkApprove = async () => {
    const pendingIds = Array.from(selectedIds).filter(
      (id) => !listings.find((l) => l.id === id)?.is_approved
    )
    if (pendingIds.length === 0) {
      toast.info("Nuk ka listime të pazgjedhura në pritje.")
      return
    }
    const toastId = toast.loading(`Duke aprovuar ${pendingIds.length} listime...`)
    const res = await handleBulkApprove(pendingIds)
    if (res?.error) {
      toast.error("Gabim gjatë aprovimit", { id: toastId, description: res.error })
    } else {
      toast.success(res.message || "Listimet u aprovuan!", { id: toastId })
    }
  }

  // Select all pending
  const onSelectAllPending = () => {
    const pendingIds = filteredListings.filter((l) => !l.is_approved).map((l) => l.id)
    selectAll(pendingIds)
  }

  // Edit Save
  const onSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingListing) return
    const toastId = toast.loading("Duke ruajtur ndryshimet...")

    const formData = new FormData(e.currentTarget)
    const priceField = formData.get("price")
    const priceValue =
      typeof priceField === "string" && priceField.trim().length
        ? Number.parseFloat(priceField)
        : Number.NaN

    const rawType = formData.get("listing_type") as string
    const listingType = (rawType || editingListing.listing_type).toLowerCase()

    const updatedData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      price: priceValue,
      unit: formData.get("unit") as string,
      location: formData.get("location") as string,
      quantity: formData.get("quantity") as string,
      listing_type: listingType,
      is_approved: approvedState,
    }

    const parsed = adminListingUpdateSchema.safeParse(updatedData)
    if (!parsed.success) {
      toast.error("Të dhënat nuk janë valide", {
        id: toastId,
        description: parsed.error.issues[0].message,
      })
      return
    }

    const res = await handleUpdate(editingListing.id, parsed.data)
    if (res?.error) {
      toast.error("Gabim gjatë ruajtjes", { id: toastId, description: res.error })
    } else {
      toast.success("Ndryshimet u ruajtën!", { id: toastId })
      setIsSheetOpen(false)
      setEditingListing(null)
    }
  }

  const openEdit = (listing: AdminListing) => {
    setEditingListing(listing)
    setApprovedState(listing.is_approved)
    setIsSheetOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Filters Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Kërko listime..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="w-[140px]">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5" />
                <SelectValue placeholder="Statusi" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Të gjitha</SelectItem>
              <SelectItem value="approved">Aprovuar</SelectItem>
              <SelectItem value="pending">Në pritje</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Lloji" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Të gjitha</SelectItem>
              <SelectItem value="shes">Shes</SelectItem>
              <SelectItem value="blej">Blej</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-emerald-700">
              {selectedIds.size} listime të zgjedhura
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="text-emerald-600 hover:text-emerald-700"
            >
              Anulo zgjedhjen
            </Button>
          </div>
          <Button
            onClick={onBulkApprove}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Aprovo të zgjedhurat
          </Button>
        </div>
      )}

      {/* Quick Select Buttons */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSelectAllPending} className="text-sm">
            Zgjidh të gjitha në pritje ({pendingCount})
          </Button>
          {selectedIds.size > 0 && (
            <span className="text-sm text-muted-foreground">({selectedIds.size} zgjedhur)</span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border bg-white shadow-sm overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    filteredListings.length > 0 &&
                    filteredListings.every((l) => selectedIds.has(l.id))
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      selectAll(filteredListings.map((l) => l.id))
                    } else {
                      clearSelection()
                    }
                  }}
                />
              </TableHead>
              <TableHead>Listimi</TableHead>
              <TableHead>Çmimi & Sasia</TableHead>
              <TableHead>Vendndodhja</TableHead>
              <TableHead>Statusi</TableHead>
              <TableHead className="text-right">Veprime</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredListings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nuk u gjet asnjë listim.
                </TableCell>
              </TableRow>
            ) : (
              filteredListings.map((item) => (
                <TableRow
                  key={item.id}
                  className={`hover:bg-gray-50/50 transition-colors ${selectedIds.has(item.id) ? "bg-emerald-50/50" : ""}`}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => toggleSelection(item.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-gray-900 line-clamp-1" title={item.title}>
                        {item.title}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Tag className="h-3 w-3" />
                        <span>{item.category}</span>
                        {item.listing_type === "shes" ? (
                          <Badge
                            variant="outline"
                            className="text-emerald-600 bg-emerald-50 border-emerald-200 text-[10px] h-4 px-1"
                          >
                            SHES
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-blue-600 bg-blue-50 border-blue-200 text-[10px] h-4 px-1"
                          >
                            BLEJ
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="font-medium">
                        € {item.price} / {item.unit}
                      </span>
                      <span className="text-xs text-muted-foreground">Sasia: {item.quantity}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {item.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.is_approved ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Aprovuar
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <XCircle className="h-3 w-3" /> Në pritje
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Veprime</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {!item.is_approved && (
                          <DropdownMenuItem onClick={() => onQuickApprove(item)}>
                            <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600" />
                            Aprovo
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => openEdit(item)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Ndrysho
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Fshij
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Ndrysho Listimin</SheetTitle>
            <SheetDescription>Bëni ndryshime në listimin e zgjedhur.</SheetDescription>
          </SheetHeader>
          {editingListing && (
            <form onSubmit={onSaveEdit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titulli</Label>
                <Input id="title" name="title" defaultValue={editingListing.title} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Përshkrimi</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingListing.description || ""}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Çmimi (€)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={editingListing.price}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Njësia</Label>
                  <Input id="unit" name="unit" defaultValue={editingListing.unit} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Sasia</Label>
                  <Input id="quantity" name="quantity" defaultValue={editingListing.quantity} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategoria</Label>
                  <Input id="category" name="category" defaultValue={editingListing.category} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Vendndodhja</Label>
                <Input id="location" name="location" defaultValue={editingListing.location} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="listing_type">Lloji</Label>
                <Select name="listing_type" defaultValue={editingListing.listing_type}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shes">Shes</SelectItem>
                    <SelectItem value="blej">Blej</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="is_approved"
                  checked={approvedState}
                  onCheckedChange={(checked) => setApprovedState(checked === true)}
                />
                <Label htmlFor="is_approved" className="text-sm font-medium">
                  I aprovuar
                </Label>
              </div>
              <SheetFooter className="pt-4">
                <SheetClose asChild>
                  <Button type="button" variant="outline">
                    Anulo
                  </Button>
                </SheetClose>
                <Button type="submit">Ruaj Ndryshimet</Button>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
