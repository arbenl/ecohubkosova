# Kosovo Recycling Companies - Quick Reference

## At a Glance

**12 companies imported** | **3 waste sectors** | **7 cities** | **2 certified**

---

## Companies by Sector

### 🏭 METAL RECYCLERS (3 companies)

1. **REC-KOS Sh.p.k.** (Prishtina) - Ferrous & non-ferrous metals, aluminum
2. **EUROPEAN METAL RECYCLING** (Obiliq) - Scrap metal, steel, stainless steel
3. _POWERPACK Sh.p.k._ (Prizren) - **Also does batteries** (see BATTERY below)

### 🔧 PLASTIC RECYCLERS (1 company)

- **PLASTIKA Sh.p.k.** (Prishtina) - PET, HDPE, LDPE

### 🛞 TIRE RECYCLERS (1 company)

- **EUROGOMA Sh.p.k.** (Ferizaj) - End-of-life tires, rubber

### 💻 ELECTRONICS/WEEE (1 company)

- **ECO KOS Sh.p.k.** (Prishtina) - WEEE, electronics ⭐ **ISCC EU certified**

### 🔋 BATTERY RECYCLING (1 company)

- **POWERPACK Sh.p.k.** (Prizren) - Lead-acid & lithium batteries ⭐ **QA-CER certified**

### 🥛 GLASS RECYCLERS (1 company)

- **KOSOVO GLASS RECYCLING** (Prishtina) - Glass bottles, containers

### ♻️ COLLECTION SERVICES (2 companies)

- **TE BLERIM LUZHA Sh.p.k.** (Peja) - General waste, recyclables, paper
- **RICIKLIMI-ED Sh.p.k.** (Gjakova) - Mixed recyclables, paper, metals

### 🌱 ORGANIC WASTE & SERVICES (2 companies)

- **SIMPLY GREEN Sh.p.k.** (Mitrovica) - Organic waste, biomass, composting
- **BIO 365 Sh.p.k.** (Prizren) - Agricultural waste, bioconversion
- **UPCYCLE KOSOVO** (Prishtina) - Textile waste, social upcycling

---

## Companies by Geography

| City          | Count | Companies                                                          |
| ------------- | ----- | ------------------------------------------------------------------ |
| **Prishtina** | 5     | REC-KOS, PLASTIKA, ECO KOS, KOSOVO GLASS RECYCLING, UPCYCLE KOSOVO |
| **Ferizaj**   | 1     | EUROGOMA                                                           |
| **Prizren**   | 3     | POWERPACK, BIO 365, (+ EMR Obiliq nearby)                          |
| **Peja**      | 1     | TE BLERIM LUZHA                                                    |
| **Mitrovica** | 1     | SIMPLY GREEN                                                       |
| **Gjakova**   | 1     | RICIKLIMI-ED                                                       |
| **Obiliq**    | 1     | EUROPEAN METAL RECYCLING                                           |

---

## Certification Status

### ✅ VERIFIED (2)

- **ECO KOS Sh.p.k.** → ISCC EU (International Sustainability & Carbon Certification)
- **POWERPACK Sh.p.k.** → QA-CER

### ⏳ UNVERIFIED (10)

- All others pending admin review & verification

---

## Waste Material Streams

| Material               | Handlers                          |
| ---------------------- | --------------------------------- |
| **Metals**             | REC-KOS, EUROPEAN METAL RECYCLING |
| **Plastic**            | PLASTIKA                          |
| **Tires**              | EUROGOMA                          |
| **Electronics (WEEE)** | ECO KOS                           |
| **Batteries**          | POWERPACK                         |
| **Glass**              | KOSOVO GLASS RECYCLING            |
| **General Waste**      | TE BLERIM LUZHA, RICIKLIMI-ED     |
| **Organic/Biomass**    | SIMPLY GREEN, BIO 365             |
| **Textiles**           | UPCYCLE KOSOVO                    |

---

## Database Records Created

```
Organizations: 12 inserted
Eco_Organizations: 12 created (1:1 relationship)
Total DB Rows: 24
```

### Example: PLASTIKA Entry

**organizations table**:

```
id:               <UUID>
name:             PLASTIKA Sh.p.k.
description:      Plastic waste collection and recycling facility...
primary_interest: Plastic Recycling
contact_person:   PLASTIKA Team
contact_email:    contact@plastika.com
location:         Prishtina, Kosovo
type:             RECYCLER
is_approved:      true
```

**eco_organizations table**:

```
organization_id:      <UUID from above>
org_role:             RECYCLER
verification_status:  UNVERIFIED
waste_types_handled:  ["Plastic waste", "PET", "HDPE", "LDPE"]
service_areas:        ["Prishtina"]
certifications:       []
metadata: {
  "phone": "+383 (0) 38 500 701",
  "sector": "Plastic Recycling",
  "notes": "Major plastic recycler"
}
```

---

## How to Use in Application

### For Marketplace V2 Listings

Organizations can now:

1. Create listings offering their waste streams (e.g., PLASTIKA offers plastic waste collection)
2. Link listings to organization (auto-populated if user is org member)
3. Display waste types handled in organization profile
4. Show certifications for verification badge

### For Discovery

Users searching marketplace can:

1. Filter by organization type (RECYCLER, COLLECTOR, SERVICE_PROVIDER)
2. Browse offerings by sector (plastic, metal, electronics, etc.)
3. Identify certified operators (VERIFIED status)
4. Contact organizations directly for bulk deals

### For Admin

Admins can:

1. View all imported organizations in admin dashboard
2. Verify unverified entries → update verification_status to VERIFIED
3. Add certifications/licenses to metadata
4. Update service_areas and waste_types_handled as needed
5. Monitor organization listings and activity

---

## Contact Information

All companies have phone & email in metadata.jsonb:

```sql
-- Query all companies with phone
SELECT
  name,
  contact_email,
  metadata->>'phone' as phone,
  location
FROM organizations
WHERE type = 'RECYCLER'
ORDER BY name;
```

---

## Future Enhancements

- [ ] Add Albanian descriptions
- [ ] Collect website URLs (currently null)
- [ ] Add social media links (Instagram, Facebook, LinkedIn)
- [ ] Obtain logo URLs for branding
- [ ] Map processing capacities (tons/year)
- [ ] Add operating hours
- [ ] Integrate with logistics (pickup available, delivery available)
- [ ] Create organization detail pages in UI
- [ ] Add inter-company supply chains (one company's output → another's input)

---

**Data imported**: November 22, 2025  
**Migration**: `20251122100000_seed_recycling_companies.sql`  
**Status**: Ready for production deployment
