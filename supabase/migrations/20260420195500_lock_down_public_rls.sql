-- Remove overly broad Data API read policies created for Security Advisor
-- warnings. Public data remains available through application API routes and
-- the narrower table policies below.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artikuj ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tregu_listime ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_listing_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_listing_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Organizations are viewable by everyone" ON public.organizations;
DROP POLICY IF EXISTS "Organization members are viewable by everyone" ON public.organization_members;
DROP POLICY IF EXISTS "Articles are viewable by everyone" ON public.artikuj;
DROP POLICY IF EXISTS "Marketplace listings are viewable by everyone" ON public.tregu_listime;
DROP POLICY IF EXISTS "Audit logs are viewable by admins only" ON public.audit_logs;
DROP POLICY IF EXISTS "Eco categories are viewable by everyone" ON public.eco_categories;
DROP POLICY IF EXISTS "Eco organizations are viewable by everyone" ON public.eco_organizations;
DROP POLICY IF EXISTS "Eco listings are viewable by everyone" ON public.eco_listings;
DROP POLICY IF EXISTS "Eco listing media is viewable by everyone" ON public.eco_listing_media;

-- User profiles are private to the owner and admins.
DROP POLICY IF EXISTS "Users: read own or admin" ON public.users;
CREATE POLICY "Users: read own or admin" ON public.users
  FOR SELECT
  USING (auth.uid() = id OR public.is_admin(auth.uid()));

-- Organization records may be public only after approval; pending orgs are
-- visible to their members and admins.
DROP POLICY IF EXISTS "Organizations: public view" ON public.organizations;
CREATE POLICY "Organizations: public view" ON public.organizations
  FOR SELECT
  USING (is_approved = true);

DROP POLICY IF EXISTS "Organizations: members view" ON public.organizations;
CREATE POLICY "Organizations: members view" ON public.organizations
  FOR SELECT
  USING (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.organization_members om
      WHERE om.organization_id = organizations.id
        AND om.user_id = auth.uid()
    )
  );

-- Membership rows are private to the member and admins.
DROP POLICY IF EXISTS "Org members: select" ON public.organization_members;
CREATE POLICY "Org members: select" ON public.organization_members
  FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Audit logs are admin-only.
DROP POLICY IF EXISTS "Admins can read audit logs" ON public.audit_logs;
CREATE POLICY "Admins can read audit logs" ON public.audit_logs
  FOR SELECT
  USING (auth.role() = 'authenticated' AND public.is_admin(auth.uid()));

-- Legacy public content remains readable only once explicitly published or approved.
DROP POLICY IF EXISTS "Published articles are public" ON public.artikuj;
CREATE POLICY "Published articles are public" ON public.artikuj
  FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Approved legacy listings are public" ON public.tregu_listime;
CREATE POLICY "Approved legacy listings are public" ON public.tregu_listime
  FOR SELECT
  USING (is_approved = true);

-- V2 public catalogue tables stay public only for non-sensitive active data.
DROP POLICY IF EXISTS "Public can view active categories" ON public.eco_categories;
CREATE POLICY "Public can view active categories" ON public.eco_categories
  FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Public can view verified eco organizations" ON public.eco_organizations;
CREATE POLICY "Public can view verified eco organizations" ON public.eco_organizations
  FOR SELECT
  USING (verification_status = 'VERIFIED');

DROP POLICY IF EXISTS "Public can view active public listings" ON public.eco_listings;
CREATE POLICY "Public can view active public listings" ON public.eco_listings
  FOR SELECT
  USING (status = 'ACTIVE' AND visibility = 'PUBLIC');

DROP POLICY IF EXISTS "Users can view media for visible listings" ON public.eco_listing_media;
CREATE POLICY "Users can view media for visible listings" ON public.eco_listing_media
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.eco_listings el
      WHERE el.id = eco_listing_media.listing_id
        AND el.status = 'ACTIVE'
        AND el.visibility = 'PUBLIC'
    )
  );
