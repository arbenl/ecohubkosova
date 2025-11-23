-- Simplified seed: Kosovo Recycling Companies
-- This version uses DO blocks to check existence before inserting

DO $$
DECLARE
  v_org_id uuid;
BEGIN
  -- Only insert if organizations don't already exist
  IF NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'REC-KOS Sh.p.k.') THEN
    
    -- Insert all 12 organizations
    INSERT INTO public.organizations (name, description, primary_interest, contact_person, contact_email, location, type, is_approved) VALUES
      ('REC-KOS Sh.p.k.', 'Metal recycling company specializing in ferrous and non-ferrous metal recovery and processing.', 'Metal Recycling', 'REC-KOS Team', 'info@rec-kos.com', 'Prishtina, Kosovo', 'RECYCLER', true),
      ('PLASTIKA Sh.p.k.', 'Plastic waste collection and recycling facility processing PET, HDPE, and LDPE materials.', 'Plastic Recycling', 'PLASTIKA Team', 'contact@plastika.com', 'Prishtina, Kosovo', 'RECYCLER', true),
      ('EUROGOMA Sh.p.k.', 'Tire recycling specialist processing end-of-life tires and rubber materials.', 'Tire Recycling', 'EUROGOMA Team', 'info@eurogoma.com', 'Ferizaj, Kosovo', 'RECYCLER', true),
      ('ECO KOS Sh.p.k.', 'WEEE recycler handling electronic waste, recovering valuable metals, plastics and materials.', 'WEEE Recycling', 'ECO KOS Team', 'info@ecokos.com', 'Prishtina, Kosovo', 'RECYCLER', true),
      ('POWERPACK Sh.p.k.', 'Battery recycling facility specializing in lead-acid and lithium battery processing.', 'Battery Recycling', 'POWERPACK Team', 'contact@powerpack.com', 'Prizren, Kosovo', 'RECYCLER', true),
      ('TE BLERIM LUZHA Sh.p.k.', 'Waste collection and management service providing primary collection for recyclables and general waste.', 'Waste Collection', 'TE BLERIM LUZHA Team', 'contact@tblussha.com', 'Peja, Kosovo', 'SERVICE_PROVIDER', true),
      ('EUROPEAN METAL RECYCLING (Local Obiliq)', 'International metal recycling company with operations in Obiliq, processing scrap metals and steel.', 'Metal Recycling', 'EMR Team', 'obiliq@emr-kosovo.com', 'Obiliq, Kosovo', 'RECYCLER', true),
      ('SIMPLY GREEN Sh.p.k.', 'Environmental services provider specializing in organic waste management and composting.', 'Organic Waste Management', 'SIMPLY GREEN Team', 'info@simplygreen.com', 'Mitrovica, Kosovo', 'SERVICE_PROVIDER', true),
      ('KOSOVO GLASS RECYCLING', 'Glass recycling specialist processing glass waste and beverage containers.', 'Glass Recycling', 'KGR Team', 'info@kosovosglass.com', 'Prishtina, Kosovo', 'RECYCLER', true),
      ('RICIKLIMI-ED Sh.p.k.', 'Recycling collection company gathering mixed recyclables and preparing materials for processing.', 'Mixed Recycling', 'RICIKLIMI-ED Team', 'contact@riciklimi-ed.com', 'Gjakova, Kosovo', 'COLLECTOR', true),
      ('BIO 365 Sh.p.k.', 'Bioconversion and composting service handling agricultural and organic waste streams.', 'Organic Waste & Compost', 'BIO 365 Team', 'info@bio365.com', 'Prizren, Kosovo', 'SERVICE_PROVIDER', true),
      ('UPCYCLE KOSOVO', 'Social upcycling enterprise transforming textile and clothing waste into quality products.', 'Textile Upcycling', 'UPCYCLE Team', 'hello@upcyclekosovo.com', 'Prishtina, Kosovo', 'SERVICE_PROVIDER', true);
    
    RAISE NOTICE 'Inserted 12 recycling companies into organizations table';
  ELSE
    RAISE NOTICE 'Organizations already exist, skipping insert';
  END IF;

  -- Insert eco_organizations for each company (with existence check)
  FOR v_org_id IN 
    SELECT id FROM organizations 
    WHERE name IN (
      'REC-KOS Sh.p.k.', 'PLASTIKA Sh.p.k.', 'EUROGOMA Sh.p.k.', 'ECO KOS Sh.p.k.',
      'POWERPACK Sh.p.k.', 'TE BLERIM LUZHA Sh.p.k.', 'EUROPEAN METAL RECYCLING (Local Obiliq)',
      'SIMPLY GREEN Sh.p.k.', 'KOSOVO GLASS RECYCLING', 'RICIKLIMI-ED Sh.p.k.',
      'BIO 365 Sh.p.k.', 'UPCYCLE KOSOVO'
    )
  LOOP
    -- Check if eco_organization already exists
    IF NOT EXISTS (SELECT 1 FROM eco_organizations WHERE organization_id = v_org_id) THEN
      -- Insert based on organization name
      INSERT INTO eco_organizations (organization_id, org_role, verification_status, waste_types_handled, service_areas, certifications, metadata)
      SELECT 
        o.id,
        CASE o.name
          WHEN 'REC-KOS Sh.p.k.' THEN 'RECYCLER'::org_role
          WHEN 'PLASTIKA Sh.p.k.' THEN 'RECYCLER'::org_role
          WHEN 'EUROGOMA Sh.p.k.' THEN 'RECYCLER'::org_role
          WHEN 'ECO KOS Sh.p.k.' THEN 'RECYCLER'::org_role
          WHEN 'POWERPACK Sh.p.k.' THEN 'RECYCLER'::org_role
          WHEN 'TE BLERIM LUZHA Sh.p.k.' THEN 'COLLECTOR'::org_role
          WHEN 'EUROPEAN METAL RECYCLING (Local Obiliq)' THEN 'RECYCLER'::org_role
          WHEN 'SIMPLY GREEN Sh.p.k.' THEN 'SERVICE_PROVIDER'::org_role
          WHEN 'KOSOVO GLASS RECYCLING' THEN 'RECYCLER'::org_role
          WHEN 'RICIKLIMI-ED Sh.p.k.' THEN 'COLLECTOR'::org_role
          WHEN 'BIO 365 Sh.p.k.' THEN 'SERVICE_PROVIDER'::org_role
          WHEN 'UPCYCLE KOSOVO' THEN 'SERVICE_PROVIDER'::org_role
        END,
        CASE o.name
          WHEN 'ECO KOS Sh.p.k.' THEN 'VERIFIED'::verification_status
          WHEN 'POWERPACK Sh.p.k.' THEN 'VERIFIED'::verification_status
          ELSE 'UNVERIFIED'::verification_status
        END,
        CASE o.name
          WHEN 'REC-KOS Sh.p.k.' THEN ARRAY['Ferrous metals', 'Non-ferrous metals', 'Aluminum']::text[]
          WHEN 'PLASTIKA Sh.p.k.' THEN ARRAY['Plastic waste', 'PET', 'HDPE', 'LDPE']::text[]
          WHEN 'EUROGOMA Sh.p.k.' THEN ARRAY['End-of-life tires', 'Rubber products']::text[]
          WHEN 'ECO KOS Sh.p.k.' THEN ARRAY['WEEE', 'Electronics', 'Metals', 'Plastics']::text[]
          WHEN 'POWERPACK Sh.p.k.' THEN ARRAY['Used batteries', 'Lead-acid batteries', 'Lithium batteries']::text[]
          WHEN 'TE BLERIM LUZHA Sh.p.k.' THEN ARRAY['General waste', 'Recyclables', 'Paper', 'Cardboard']::text[]
          WHEN 'EUROPEAN METAL RECYCLING (Local Obiliq)' THEN ARRAY['Scrap metal', 'Steel', 'Stainless steel', 'Mixed metals']::text[]
          WHEN 'SIMPLY GREEN Sh.p.k.' THEN ARRAY['Organic waste', 'Biomass', 'Compost']::text[]
          WHEN 'KOSOVO GLASS RECYCLING' THEN ARRAY['Glass waste', 'Glass bottles', 'Glass containers']::text[]
          WHEN 'RICIKLIMI-ED Sh.p.k.' THEN ARRAY['Mixed recyclables', 'Waste paper', 'Cardboard', 'Metals']::text[]
          WHEN 'BIO 365 Sh.p.k.' THEN ARRAY['Organic waste', 'Agricultural waste', 'Biomass', 'Compost']::text[]
          WHEN 'UPCYCLE KOSOVO' THEN ARRAY['Waste textiles', 'Clothing', 'Fabric scraps', 'Upcycled products']::text[]
        END,
        CASE o.name
          WHEN 'REC-KOS Sh.p.k.' THEN ARRAY['Prishtina', 'Prizren']::text[]
          WHEN 'PLASTIKA Sh.p.k.' THEN ARRAY['Prishtina']::text[]
          WHEN 'EUROGOMA Sh.p.k.' THEN ARRAY['Ferizaj']::text[]
          WHEN 'ECO KOS Sh.p.k.' THEN ARRAY['Prishtina']::text[]
          WHEN 'POWERPACK Sh.p.k.' THEN ARRAY['Prizren']::text[]
          WHEN 'TE BLERIM LUZHA Sh.p.k.' THEN ARRAY['Peja']::text[]
          WHEN 'EUROPEAN METAL RECYCLING (Local Obiliq)' THEN ARRAY['Obiliq', 'Prizren']::text[]
          WHEN 'SIMPLY GREEN Sh.p.k.' THEN ARRAY['Mitrovica']::text[]
          WHEN 'KOSOVO GLASS RECYCLING' THEN ARRAY['Prishtina']::text[]
          WHEN 'RICIKLIMI-ED Sh.p.k.' THEN ARRAY['Gjakova']::text[]
          WHEN 'BIO 365 Sh.p.k.' THEN ARRAY['Prizren']::text[]
          WHEN 'UPCYCLE KOSOVO' THEN ARRAY['Prishtina']::text[]
        END,
        CASE o.name
          WHEN 'ECO KOS Sh.p.k.' THEN ARRAY['ISCC EU']::text[]
          WHEN 'POWERPACK Sh.p.k.' THEN ARRAY['QA-CER']::text[]
          ELSE ARRAY[]::text[]
        END,
        jsonb_build_object('phone', o.contact_email, 'sector', o.primary_interest, 'notes', 'Kosovo recycling company')
      FROM organizations o
      WHERE o.id = v_org_id;
    END IF;
  END LOOP;

  RAISE NOTICE 'Eco organizations seed complete';
END $$;
