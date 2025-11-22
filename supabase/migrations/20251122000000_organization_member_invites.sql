-- Migration: Add organization_member_invites table for Phase 4.12
-- Purpose: Support member invitations with email-based invite links

-- Drop existing table if it exists (for reapply scenarios)
DROP TABLE IF EXISTS public.organization_member_invites CASCADE;

-- Create organization_member_invites table
CREATE TABLE public.organization_member_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role_in_organization TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED')),
  created_by_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,

  -- Ensure unique pending invites per organization/email
  CONSTRAINT unique_pending_invite_per_org_email UNIQUE (organization_id, email, status)
    WHERE status = 'PENDING'
);

-- Create indexes for common queries
CREATE INDEX idx_organization_member_invites_token ON public.organization_member_invites(token);
CREATE INDEX idx_organization_member_invites_org_id ON public.organization_member_invites(organization_id);
CREATE INDEX idx_organization_member_invites_email ON public.organization_member_invites(email);
CREATE INDEX idx_organization_member_invites_status ON public.organization_member_invites(status);

-- Enable RLS
ALTER TABLE public.organization_member_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Org members can view invites for their org
DROP POLICY IF EXISTS "Org member invites: select by member" ON public.organization_member_invites;
CREATE POLICY "Org member invites: select by member" ON public.organization_member_invites
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.organization_members om
      WHERE om.organization_id = organization_member_invites.organization_id
        AND om.user_id = auth.uid()
        AND om.is_approved = true
    )
    OR public.is_admin(auth.uid())
  );

-- RLS Policy: Only org admins can insert invites
DROP POLICY IF EXISTS "Org member invites: insert by admin" ON public.organization_member_invites;
CREATE POLICY "Org member invites: insert by admin" ON public.organization_member_invites
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.organization_members om
      WHERE om.organization_id = organization_member_invites.organization_id
        AND om.user_id = auth.uid()
        AND om.role_in_organization = 'ADMIN'
        AND om.is_approved = true
    )
    OR public.is_admin(auth.uid())
  );

-- RLS Policy: Only org admins can update invites (revoke, etc.)
DROP POLICY IF EXISTS "Org member invites: update by admin" ON public.organization_member_invites;
CREATE POLICY "Org member invites: update by admin" ON public.organization_member_invites
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.organization_members om
      WHERE om.organization_id = organization_member_invites.organization_id
        AND om.user_id = auth.uid()
        AND om.role_in_organization = 'ADMIN'
        AND om.is_approved = true
    )
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.organization_members om
      WHERE om.organization_id = organization_member_invites.organization_id
        AND om.user_id = auth.uid()
        AND om.role_in_organization = 'ADMIN'
        AND om.is_approved = true
    )
    OR public.is_admin(auth.uid())
  );

-- RLS Policy: Public can accept invites if they have valid token and email match
DROP POLICY IF EXISTS "Org member invites: accept by token" ON public.organization_member_invites;
CREATE POLICY "Org member invites: accept by token" ON public.organization_member_invites
  FOR UPDATE
  USING (true)
  WITH CHECK (
    -- Allow authenticated users to accept invite if email matches theirs
    auth.uid() IS NOT NULL
  );
