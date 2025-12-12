"use client"

import { useState } from "react"
import { useAdminOrganizations, AdminOrganization } from "@/hooks/use-admin-organizations"
import { AdminOrganizationUpdateInput, adminOrganizationUpdateSchema } from "@/validation/admin"
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
  SheetTrigger,
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
  Building2,
  MapPin,
  Mail,
  User,
  Trash2,
  Edit,
  Filter,
} from "lucide-react"
import { toast } from "sonner"

interface OrganizationsClientPageProps {
  initialOrganizations: AdminOrganization[]
}

export default function OrganizationsClientPage({
  initialOrganizations,
}: OrganizationsClientPageProps) {
  const { organizations, handleDelete, handleUpdate, handleApprove } =
    useAdminOrganizations(initialOrganizations)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const [editingOrg, setEditingOrg] = useState<AdminOrganization | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Controlled state
  const [approvedState, setApprovedState] = useState(false)

  // Filter Logic
  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.contact_email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "approved"
          ? org.is_approved
          : !org.is_approved
    const matchesType = typeFilter === "all" ? true : org.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const onQuickApprove = async (org: AdminOrganization) => {
    const toastId = toast.loading("Duke aprovuar organizatën...")
    const res = await handleApprove(org.id)
    if (res?.error) {
      toast.error("Gabim gjatë aprovimit", { id: toastId })
    } else {
      toast.success("Organizata u aprovua!", { id: toastId })
    }
  }

  // Edit Form Handler
  const onSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingOrg) return
    const toastId = toast.loading("Duke ruajtur ndryshimet...")

    const formData = new FormData(e.currentTarget)
    const updatedData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      primary_interest: formData.get("primary_interest") as string,
      contact_person: formData.get("contact_person") as string,
      contact_email: formData.get("contact_email") as string,
      location: formData.get("location") as string,
      type: formData.get("type") as "Kompani" | "OJQ" | "Ndërmarrje Sociale", // Type cast for schema
      is_approved: approvedState, // Use controlled state
    }

    // Validate
    const parsed = adminOrganizationUpdateSchema.safeParse(updatedData)
    if (!parsed.success) {
      toast.error("Të dhënat nuk janë valide", {
        id: toastId,
        description: parsed.error.issues[0].message,
      })
      console.error(parsed.error)
      return
    }

    const res = await handleUpdate(editingOrg.id, parsed.data)
    if (res?.error) {
      toast.error("Gabim gjatë ruajtjes", { id: toastId, description: res.error })
    } else {
      toast.success("Ndryshimet u ruajtën!", { id: toastId })
      setIsSheetOpen(false)
      setEditingOrg(null)
    }
  }

  const openEdit = (org: AdminOrganization) => {
    setEditingOrg(org)
    setApprovedState(org.is_approved)
    setIsSheetOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Kërko organizata..."
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
              <SelectItem value="all">Të gjitha Llojet</SelectItem>
              <SelectItem value="OJQ">OJQ</SelectItem>
              <SelectItem value="Ndërmarrje Sociale">Ndërmarrje Sociale</SelectItem>
              <SelectItem value="Kompani">Kompani</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table - with horizontal scroll on mobile */}
      <div className="rounded-md border bg-white shadow-sm overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Organizata</TableHead>
              <TableHead>Kontakti</TableHead>
              <TableHead>Detaje</TableHead>
              <TableHead>Statusi</TableHead>
              <TableHead className="text-right">Veprime</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrgs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nuk u gjet asnjë organizatë.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrgs.map((org) => (
                <TableRow key={org.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">{org.name}</span>
                      <span
                        className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]"
                        title={org.description}
                      >
                        {org.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{org.contact_person}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{org.contact_email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      <Badge variant="outline" className="w-fit">
                        {org.type}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {org.location}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {org.is_approved ? (
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none shadow-none">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Aprovuar
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none shadow-none">
                        <XCircle className="h-3 w-3 mr-1" /> Në pritje
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!org.is_approved && (
                        <Button
                          size="sm"
                          onClick={() => onQuickApprove(org)}
                          className="h-8 px-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                          title="Aprovo Tani"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Veprime</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEdit(org)}>
                            <Edit className="h-4 w-4 mr-2" /> Edito Detajet
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDelete(org.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Fshije Organizatën
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Sheet (Replacing Modal) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Edito Organizatën</SheetTitle>
            <SheetDescription>
              Ndrysho të dhënat e organizatës këtu. Kliko ruaj kur të kesh mbaruar.
            </SheetDescription>
          </SheetHeader>
          {editingOrg && (
            <form onSubmit={onSaveEdit} className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="name">Emri i Organizatës</Label>
                <Input id="name" name="name" defaultValue={editingOrg.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Përshkrimi</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingOrg.description}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Lloji</Label>
                  <Select name="type" defaultValue={editingOrg.type}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OJQ">OJQ</SelectItem>
                      <SelectItem value="Ndërmarrje Sociale">Ndërmarrje Sociale</SelectItem>
                      <SelectItem value="Kompani">Kompani</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Vendndodhja</Label>
                  <Input id="location" name="location" defaultValue={editingOrg.location} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="primary_interest">Interesi Primar</Label>
                <Input
                  id="primary_interest"
                  name="primary_interest"
                  defaultValue={editingOrg.primary_interest}
                />
              </div>
              <div className="space-y-2">
                <Label>Kontakti</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="contact_person"
                    name="contact_person"
                    defaultValue={editingOrg.contact_person}
                    placeholder="Personi"
                  />
                  <Input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    defaultValue={editingOrg.contact_email}
                    placeholder="Email"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 border p-4 rounded-md bg-gray-50">
                <Checkbox
                  id="is_approved"
                  checked={approvedState}
                  onCheckedChange={(c) => setApprovedState(c === true)}
                />
                <Label htmlFor="is_approved" className="font-semibold text-gray-900 cursor-pointer">
                  Aprovo këtë organizatë
                </Label>
              </div>

              <SheetFooter className="pt-4">
                <SheetClose asChild>
                  <Button variant="outline" type="button">
                    Anulo
                  </Button>
                </SheetClose>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Ruaj Ndryshimet
                </Button>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
