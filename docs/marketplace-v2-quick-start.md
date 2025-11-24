# 🚀 UDHËZIME TË SHPEJTA - Si të ekzekutosh Test Listings

## Metoda 1: Përmes Supabase SQL Editor (Recommended) ⭐

### Hapa:

1. **Hap Supabase Dashboard**
   ```
   https://supabase.com → Projekti: EcoHub Kosova
   ```

2. **Gjej IDs e nevojshme**

   Në SQL Editor, ekzekuto:
   ```sql
   -- Gjej user ID
   SELECT id, email FROM users LIMIT 5;
   
   -- Gjej category IDs
   SELECT id, slug, name_sq FROM eco_categories 
   WHERE slug IN ('materials-metals', 'products-furniture', 'services-collection');
   ```

3. **Hap file-in SQL**
   - File: `scripts/marketplace-v2-test-data.sql`
   - Kopjo të gjithë përmbajtjen

4. **Zëvendëso placeholders në SQL editor**
   - `<YOUR_USER_ID>` → ID-ja e user-it (nga hapi 2)
   - `<CATEGORY_ID_MATERIALS>` → ID e kategorisë materials-metals
   - `<CATEGORY_ID_PRODUCTS>` → ID e kategorisë products-furniture
   - `<CATEGORY_ID_SERVICES>` → ID e kategorisë services-collection

5. **Ekzekuto query-n**
   - Kliko **RUN** ose shtyp **Ctrl+Enter**
   - Duhet të shohësh: "Success. No rows returned" x3

6. **Verifiko**
   ```
   http://localhost:3000/sq/marketplace-v2
   ```
   Duhet të shohësh 3 listings të reja!

---

## Metoda 2: Përmes Supabase CLI (Për advanced users)

### Hapa:

1. **Pregatit file-in**
   ```bash
   cd /Users/arbenlila/development/ecohubkosova
   cp scripts/marketplace-v2-test-data.sql scripts/temp-test-data.sql
   ```

2. **Edito file-in temp**
   - Hap `scripts/temp-test-data.sql` në editor
   - Zëvendëso placeholders me ID reale
   - Ruaj file-in

3. **Ekzekuto via CLI**
   ```bash
   supabase db execute < scripts/temp-test-data.sql
   ```

4. **Pastro temp file**
   ```bash
   rm scripts/temp-test-data.sql
   ```

---

## Kontrolle Pas Ekzekutimit

### A) Kontrollo në Supabase Dashboard

1. Shko tek **Table Editor** → `eco_listings`
2. Duhet të shohësh 3 rreshta të rinj
3. Kontrollo që **status** = `ACTIVE` dhe **visibility** = `PUBLIC`

### B) Kontrollo në Web UI

1. Hap browser:
   ```
   http://localhost:3000/sq/marketplace-v2
   ```

2. Duhet të shohësh 3 karta:
   - **Listing 1**: "Alumin i ricikluar..." - Material badge blu
   - **Listing 2**: "Tavolina nga palet druri..." - Produkt badge gjelbër
   - **Listing 3**: "Shërbim grumbullimi..." - Shërbim badge teal

3. Testo filtrat:
   - Kliko "Materials" → duhet të shfaqet vetëm alumini
   - Kliko "Products" → vetëm tavolina
   - Kliko "Services" → vetëm shërbimi

4. Testo search:
   - Shkruaj "alumin" → duhet të gjejë listing-un e parë
   - Shkruaj "palet" → duhet të gjejë tavolinën

---

## Troubleshooting

### Error: "duplicate key value violates unique constraint"
**Shkak**: Po ekzekuton të njëjtin SQL dy herë  
**Zgjidhje**: Listings-et janë shtuar tashmë. Shiko Table Editor për të konfirmuar.

### Error: "insert or update on table violates foreign key constraint"
**Shkak**: User ID ose Category ID nuk ekziston  
**Zgjidhje**: Kontrollo sërish ID-të në hapat 2. Sigurohu që janë kopjuar saktë.

### Listings nuk shfaqen në UI
**Shkaqe të mundshme**:
1. Dev server nuk është i ndezur → ekzekuto `pnpm dev`
2. Filters janë aktive → kliko "Clear filters" ose "Të gjitha"
3. Status nuk është ACTIVE → ndrysho në Table Editor

---

## Shembull i Plotë (Copy-Paste Ready)

Pas që të kesh gjetur ID-të, zëvendëso në këtë shembull:

```sql
-- SHEMBULL ME ID REALE (ZËVENDËSO ME ID-TË QË GJETE!)
INSERT INTO eco_listings (
  id, created_by_user_id, category_id,
  title, description, flow_type,
  pricing_type, price, currency,
  status, visibility, country, city,
  eco_labels, tags
) VALUES (
  gen_random_uuid(),
  '12345678-abcd-1234-abcd-123456789abc',  -- ZËVENDËSO ME USER ID
  'abcdef12-3456-7890-abcd-ef1234567890',  -- ZËVENDËSO ME CATEGORY ID
  'Test Listing - Plastikë',
  'Kjo është një listing testuese',
  'OFFER_MATERIAL',
  'FIXED',
  50.00,
  'EUR',
  'ACTIVE',
  'PUBLIC',
  'XK',
  'Prishtinë',
  ARRAY['RECYCLED_CONTENT'],
  ARRAY['test', 'plastikë']
);
```

---

**Gëzuar testimin! 🌱**
