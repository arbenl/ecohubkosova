
    -- 1. Fix: eco_organizations
    DROP POLICY IF EXISTS "Org members can update their eco organization" ON eco_organizations;
    CREATE POLICY "Org members can update their eco organization"
      ON eco_organizations FOR UPDATE
      USING (
        auth.role() = 'authenticated' AND
        EXISTS (
          SELECT 1 FROM organization_members
          WHERE organization_members.organization_id = eco_organizations.organization_id
          AND organization_members.user_id = auth.uid()
        )
      );

    -- 2. Fix: eco_listings
    DROP POLICY IF EXISTS "Users can update their own listings" ON eco_listings;
    CREATE POLICY "Users can update their own listings"
      ON eco_listings FOR UPDATE
      USING (auth.role() = 'authenticated' AND auth.uid() = created_by_user_id);
    
    DROP POLICY IF EXISTS "Org members can update org listings" ON eco_listings;
    CREATE POLICY "Org members can update org listings"
      ON eco_listings FOR UPDATE
      USING (
        auth.role() = 'authenticated' AND
        organization_id IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM organization_members om 
          JOIN eco_organizations eo ON om.organization_id = eo.organization_id
          WHERE eo.id = eco_listings.organization_id
          AND om.user_id = auth.uid()
        )
      );

    -- 3. Fix: eco_listing_media
    DROP POLICY IF EXISTS "Users can manage media for their listings" ON eco_listing_media;
    CREATE POLICY "Users can manage media for their listings"
      ON eco_listing_media FOR ALL
      USING (
        auth.role() = 'authenticated' AND
        EXISTS (
          SELECT 1 FROM eco_listings el
          WHERE el.id = eco_listing_media.listing_id
          AND el.created_by_user_id = auth.uid()
        )
      );

    -- 4. Fix: eco_listing_interactions
    DROP POLICY IF EXISTS "Users can view their own interactions" ON eco_listing_interactions;
    CREATE POLICY "Users can view their own interactions"
      ON eco_listing_interactions FOR SELECT
      USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert their own interactions" ON eco_listing_interactions;
    CREATE POLICY "Users can insert their own interactions"
      ON eco_listing_interactions FOR INSERT
      WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete their own interactions" ON eco_listing_interactions;
    CREATE POLICY "Users can delete their own interactions"
      ON eco_listing_interactions FOR DELETE
      USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

    -- 5. Fix: audit_logs
    DROP POLICY IF EXISTS "Admins can read audit logs" ON audit_logs;
    CREATE POLICY "Admins can read audit logs"
      ON audit_logs FOR SELECT
      USING (auth.role() = 'authenticated' AND public.is_admin(auth.uid()));

    -- 6. Fix: cities
    DROP POLICY IF EXISTS "Cities: admin manage" ON cities;
    CREATE POLICY "Cities: admin manage"
      ON cities FOR ALL
      USING (auth.role() = 'authenticated' AND public.is_admin(auth.uid()))
      WITH CHECK (auth.role() = 'authenticated' AND public.is_admin(auth.uid()));
  