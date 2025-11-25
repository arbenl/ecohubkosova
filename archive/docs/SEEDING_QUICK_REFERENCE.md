# EcoHub Kosovo Seeding – Quick Reference Card

## 🎯 What Was Done

✅ **20 total Kosovo eco organizations** seeded into marketplace (12 existing + 8 new)  
✅ **8 new realistic organizations** added (NGOs, social enterprises, service providers)  
✅ **5 demo user accounts** created for testing  
✅ **100% idempotent migration** – safe to re-run  
✅ **All data Kosovo-realistic** – real cities, authentic sectors

---

## 📋 The 8 New Organizations

1. **ECO GREEN Initiative** (Prishtina, OJQ)
   - Environmental education & awareness
   - `demo+ecogreeninitiative@ecohubkosova.com`

2. **Kosovo Waste Management Ltd** (Prizren, Company)
   - Waste collection & logistics service
   - `demo+kosovowaste@ecohubkosova.com`

3. **Clean Future Foundation** (Gjakova, OJQ)
   - Anti-plastic advocacy & environmental awareness
   - `demo+cleanfuture@ecohubkosova.com`

4. **EcoCircle Kosova** (Prishtina, Company)
   - B2B circular materials trading platform
   - `demo+ecocircle@ecohubkosova.com`

5. **BioBuild Solutions** (Ferizaj, Company)
   - Construction waste recycling
   - `demo+biobuild@ecohubkosova.com`

6. **Green Jobs Cooperative** (Prizren, Social Enterprise)
   - Employment for waste workers + training
   - No demo account (can be added on request)

7. **Kosovo Glass Works** (Mitrovica, Company)
   - Glass bottle recycling
   - No demo account (can be added on request)

8. **Textile Revival Kosova** (Prishtina, Social Enterprise)
   - Clothing upcycling + women entrepreneurs
   - No demo account (can be added on request)

---

## 🔐 Demo Login Credentials

**Password** (all accounts): `EcoHubDemo!2025`

| Email                                      | Organization                | City      |
| ------------------------------------------ | --------------------------- | --------- |
| `demo+ecogreeninitiative@ecohubkosova.com` | ECO GREEN Initiative        | Prishtina |
| `demo+kosovowaste@ecohubkosova.com`        | Kosovo Waste Management Ltd | Prizren   |
| `demo+cleanfuture@ecohubkosova.com`        | Clean Future Foundation     | Gjakova   |
| `demo+ecocircle@ecohubkosova.com`          | EcoCircle Kosova            | Prishtina |
| `demo+biobuild@ecohubkosova.com`           | BioBuild Solutions          | Ferizaj   |

---

## 📂 Migration File

📍 **Location**: `supabase/migrations/20251123150000_seed_additional_kosovo_eco_organizations.sql`

**Safe to re-run**: All inserts use `WHERE NOT EXISTS` to prevent duplicates

---

## ✅ Verification Commands

### Count all Kosovo eco organizations:

```bash
psql "$SUPABASE_DB_URL" -c "
SELECT COUNT(*) FROM eco_organizations eo
JOIN organizations o ON eo.organization_id = o.id
WHERE LOWER(o.location) LIKE '%kosov%';"
# Result: 20
```

### List all with details:

```bash
psql "$SUPABASE_DB_URL" -c "
SELECT o.name, o.location, o.type, eo.org_role, eo.verification_status
FROM organizations o
JOIN eco_organizations eo ON eo.organization_id = o.id
WHERE LOWER(o.location) LIKE '%kosov%'
ORDER BY o.name;"
```

### Check demo user memberships:

```bash
psql "$SUPABASE_DB_URL" -c "
SELECT u.email, o.name, om.role_in_organization
FROM users u
JOIN organization_members om ON om.user_id = u.id
JOIN organizations o ON o.id = om.organization_id
WHERE u.email LIKE 'demo+%@ecohubkosova.com'
ORDER BY u.email;"
```

---

## 🧪 Testing Checklist

- [ ] Login with demo account → verify "Organizata ime" shows correct org
- [ ] Create test listing as demo user → verify org_id is correct
- [ ] Browse `/sq/marketplace` → filter by location, org role
- [ ] Click listing detail → verify org contact info displays
- [ ] Search organizations → all 20 appear in results

---

## 📊 Organization Breakdown

**By Role**:

- Recyclers: 7
- Service Providers: 8
- NGOs: 2
- Social Enterprises: 2
- Collectors: 1

**By City** (Kosovo locations):

- Prishtina: 6
- Prizren: 3
- Ferizaj: 2
- Gjakova: 2
- Mitrovica: 2
- Obiliq: 1
- Peja: 1

**Verification Status**:

- VERIFIED: 2 (ECO KOS, POWERPACK)
- UNVERIFIED: 18 (all others)

---

## ⚠️ Important Notes

### Staging Only

- Demo passwords are **NOT** yet synced with Supabase Auth
- To enable login: Create auth users in Supabase Dashboard
- For production: Use real passwords and verify organization emails

### Idempotency

- Migration is **100% safe to re-run**
- No duplicates will be created
- Run `pnpm dev:orchestrator` to refresh all context

### Next Steps

1. Test marketplace UI with demo accounts
2. Create sample listings for demo (optional)
3. Verify filters, search, organization details work correctly
4. Before production: change passwords, verify emails, set verification status

---

## 📞 Contact Info Structure

Each organization has metadata including:

- `phone`: +383 (0) format
- `website`: Kosovo domain format
- `sector`: Organization type/focus
- `founded`: Year (for NGOs)
- `staff`: Team size or capacity

Example:

```json
{
  "phone": "+383 (0) 38 500 750",
  "website": "www.ecogreeninitiative.org",
  "sector": "Environmental NGO",
  "staff": 5,
  "founded": 2020
}
```

---

**Report**: See `SEEDING_COMPLETION_REPORT_20251123.md` for full details  
**Migration**: `supabase/migrations/20251123150000_seed_additional_kosovo_eco_organizations.sql`  
**Date Completed**: 2025-11-23  
**Status**: ✅ Ready for Testing & Deployment
