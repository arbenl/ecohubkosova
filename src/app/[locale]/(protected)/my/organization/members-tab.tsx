"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Users, Mail, Plus, Trash2, ChevronDown } from "lucide-react"
import type { OrganizationMemberInfo } from "@/services/organization-members"
import { fetchOrganizationMembersAction, sendInviteAction, removeMemberAction } from "./members-actions"

interface MembersTabProps {
  organizationId: string
  userRole: string
  isLoading?: boolean
  onLoad?: () => void
}

export default function MembersTab({
  organizationId,
  userRole,
  isLoading = false,
  onLoad,
}: MembersTabProps) {
  const t = useTranslations("my-organization")
  const [members, setMembers] = useState<OrganizationMemberInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("EDITOR")
  const [invitingSending, setInviteSending] = useState(false)

  const isAdmin = userRole === "ADMIN"

  const loadMembers = async () => {
    setLoading(true)
    try {
      const { data, error } = await fetchOrganizationMembersAction(organizationId)
      if (!error && data) {
        setMembers(data)
      }
    } catch (err) {
      console.error("Failed to load members:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail || !inviteRole) return

    setInviteSending(true)
    try {
      const { data, error } = await sendInviteAction(
        organizationId,
        inviteEmail,
        inviteRole as "ADMIN" | "EDITOR" | "VIEWER"
      )

      if (!error && data) {
        setInviteEmail("")
        setInviteRole("EDITOR")
        setShowInviteForm(false)
        // Optionally reload members
        await loadMembers()
      } else {
        alert(error || t("members.invite.error"))
      }
    } catch (err) {
      console.error("Failed to send invite:", err)
      alert(t("members.invite.error"))
    } finally {
      setInviteSending(false)
    }
  }

  const handleRemove = async (memberId: string, memberName: string) => {
    if (!window.confirm(t("members.confirmations.removeDescription").replace("{name}", memberName))) {
      return
    }

    try {
      const { error } = await removeMemberAction(organizationId, memberId)
      if (!error) {
        await loadMembers()
      } else {
        alert(error || "Failed to remove member")
      }
    } catch (err) {
      console.error("Failed to remove member:", err)
      alert("Failed to remove member")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("members.title")}</h2>
          <p className="mt-1 text-sm text-gray-600">{t("members.subtitle")}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            {t("members.invite.title")}
          </button>
        )}
      </div>

      {/* Invite Form */}
      {isAdmin && showInviteForm && (
        <form
          onSubmit={handleInvite}
          className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">{t("members.invite.emailLabel")}</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder={t("members.invite.emailPlaceholder")}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t("members.invite.roleLabel")}</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="EDITOR">{t("members.roleLabels.EDITOR")}</option>
              <option value="VIEWER">{t("members.roleLabels.VIEWER")}</option>
              <option value="ADMIN">{t("members.roleLabels.ADMIN")}</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={invitingSending}
              className="flex-1 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {invitingSending ? t("members.invite.sending") : t("members.invite.submit")}
            </button>
            <button
              type="button"
              onClick={() => setShowInviteForm(false)}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              {t("members.invite.cancel")}
            </button>
          </div>
        </form>
      )}

      {/* Members List */}
      {members.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">{t("members.empty.title")}</h3>
          <p className="mt-1 text-sm text-gray-600">{t("members.empty.description")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-600">{t("members.table.name")}</th>
                <th className="px-6 py-3 text-left font-medium text-gray-600">{t("members.table.email")}</th>
                <th className="px-6 py-3 text-left font-medium text-gray-600">{t("members.table.role")}</th>
                <th className="px-6 py-3 text-left font-medium text-gray-600">{t("members.table.joinedDate")}</th>
                {isAdmin && <th className="px-6 py-3 text-left font-medium text-gray-600">{t("members.table.actions")}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{member.name}</td>
                  <td className="px-6 py-4 text-gray-600">{member.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      {t(`members.roleLabels.${member.role}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(member.joined_at).toLocaleDateString()}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleRemove(member.id, member.name)}
                        className="text-red-600 hover:text-red-700"
                        title={t("members.actions.remove")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
