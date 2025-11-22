# 📚 TUTORIAL: Si të shtojmë Listings në Marketplace V2

Ky dokument shpjegon si të shtosh shpallje të reja në Marketplace V2 të EcoHub Kosova.

---

## 1. Si të shtojmë listings testuese si admin (Supabase)

### Hapi 1: Gjej ID-të e nevojshme

Përpara se të shtosh një listing, ke nevojë për disa ID:

**A) User ID (krijuesi i listing-ut)**

1. Hap **Supabase Dashboard** → [https://supabase.com](https://supabase.com)
2. Zgjedh projektin **EcoHub Kosova**
3. Shko tek **Table Editor** (majtas)
4. Zgjidh tabelën **`users`**
5. Gjej user-in që do të jetë krijues i listing-ut
6. Kopjo **ID-në** (shtylla e parë) - do të duket si: `a1b2c3d4-5678-90ab-cdef-1234567890ab`

**B) Category ID**

1. Në **Table Editor**, zgjidh tabelën **`eco_categories`**
2. Shiko kategoritë ekzistuese:
   - `materials` dhe nënkategoritë (materials-metals, materials-plastics, etj.)
   - `products` dhe nënkategoritë (products-furniture, products-clothing, etj.)
   - `services` dhe nënkategoritë (services-repair, services-collection, etj.)
3. Kopjo **ID-në** e kategorisë që përshtatet me listing-un tënd

**Shembull**:
```
Për një listing "Alumin i ricikluar":
- Zgjidh kategorinë: materials-metals
- Kopjo ID-në: e.g., "abc123..."
```

---

### Hapi 2: Përdor SQL për të shtuar listing

**Opsioni A: Përmes SQL Editor (Recommended)**

1. Shko tek **SQL Editor** në Supabase
2. Hap file-in `scripts/marketplace-v2-test-data.sql` nga repoja jonë
3. **Zëvendëso placeholders**:
   - `<YOUR_USER_ID>` → ID-ja e user-it që gjete
   - `<CATEGORY_ID_MATERIALS>` → ID-ja e kategorisë për materiale
   - `<CATEGORY_ID_PRODUCTS>` → ID-ja e kategorisë për produkte
   - `<CATEGORY_ID_SERVICES>` → ID-ja e kategorisë për shërbime
4. Kliko **RUN** ose Ctrl+Enter
5. Kontrollo suksesin - duhet të shohësh: `Success. No rows returned`

**Opsioni B: Përmes Table Editor (Më i ngadaltë por më visual)**

1. Shko tek **Table Editor** → **`eco_listings`**
2. Kliko **Insert** → **Insert row**
3. Plotëso fushat (shiko tabelën më poshtë për fushat e detyrueshme)
4. Kliko **Save**

---

### Hapi 3: Fusha të detyrueshme dhe shembuj

Kur fut një listing të ri, këto janë fushat kryesore:

| Fusha | E detyrueshme? | Shembull | Shpjegim |
|-------|----------------|----------|----------|
| **id** | Po | `gen_random_uuid()` | Gjenerohet automatikisht |
| **created_by_user_id** | Po | `abc123...` | ID-ja e user-it krijues |
| **category_id** | Po | `xyz789...` | ID-ja e kategorisë |
| **title** | Po | `"Alumin i ricikluar - 500kg"` | Titulli i listing-ut |
| **description** | Po | `"Material cilësor alumini..."` | Përshkrimi (mund të jetë i gjatë) |
| **flow_type** | Po | `OFFER_MATERIAL` | Lloji: `OFFER_MATERIAL`, `OFFER_RECYCLED_PRODUCT`, `SERVICE_REPAIR`, `REQUEST_MATERIAL` etj. |
| **pricing_type** | Po | `FIXED` | `FIXED`, `NEGOTIABLE`, `FREE`, `BARTER`, `ON_REQUEST` |
| **status** | Po | `ACTIVE` | `DRAFT` (draft), `ACTIVE` (aktiv), `ARCHIVED` (arkivuar) |
| **visibility** | Po | `PUBLIC` | `PUBLIC`, `MEMBERS_ONLY`, `PRIVATE` |
| **country** | Po | `XK` | Kodi i shtetit (Kosovo = XK) |
| **city** | Jo | `"Prishtinë"` | Qyteti |
| **region** | Jo | `"Prishtinë"` | Regjioni |
| **price** | Jo | `150.00` | Çmimi (vendos NULL nëse është ON_REQUEST) |
| **currency** | Jo | `EUR` | Monedha |
| **quantity** | Jo | `500` | Sasia |
| **unit** | Jo | `kg` | Njësia (kg, pieces, ton, m2, etj.) |
| **eco_labels** | Jo | `ARRAY['RECYCLED_CONTENT', 'LOCAL']` | Etiketa eco (array) |
| **tags** | Jo | `ARRAY['alumin', 'metal', 'riciklim']` | Etiketa për kërkim (array) |
| **condition** | Jo | `SCRAP` | Gjendja: `NEW`, `USED_GOOD`, `SCRAP`, etj. |

---

### Hapi 4: Kontrollo rezultatin

1. Hap browser:
   ```
   http://localhost:3000/sq/marketplace-v2
   ```
2. Duhet të shohësh listing-un e ri në grid
3. Kontrollo:
   - ✓ Titulli dhe përshkrimi shfaqen saktë
   - ✓ Badge për **flow type** (Material, Produkt, Shërbim) është i saktë
   - ✓ Çmimi shfaqet (ose "On request")
   - ✓ Vendndodhja (qyteti) shfaqet
   - ✓ Etiketa eco (badge të gjelbërta) shfaqen

---

### Shembuj të Plotë SQL

**Listing për Material:**
```sql
INSERT INTO eco_listings (
  id, created_by_user_id, category_id,
  title, description, flow_type,
  pricing_type, price, currency,
  status, visibility, country, city,
  eco_labels, tags
) VALUES (
  gen_random_uuid(),
  'abc-123-user-id',
  'xyz-category-materials-plastics',
  'Plastikë PET e ricikluar - 2 ton',
  'Plastikë PET cilësore nga shishet. E gatshme për ripërpunim.',
  'OFFER_MATERIAL',
  'FIXED',
  300.00,
  'EUR',
  'ACTIVE',
  'PUBLIC',
  'XK',
  'Prizren',
  ARRAY['RECYCLED_CONTENT', 'LOCAL'],
  ARRAY['plastikë', 'PET', 'riciklim']
);
```

**Listing për Shërbim:**
```sql
INSERT INTO eco_listings (
  id, created_by_user_id, category_id,
  title, description, flow_type,
  pricing_type,
  status, visibility, country, city,
  eco_labels, tags
) VALUES (
  gen_random_uuid(),
  'abc-123-user-id',
  'xyz-category-services-repair',
  'Riparim pajisje elektronike',
  'Shërbim profesional i riparimit të laptopëve, telefonave dhe tabletave.',
  'SERVICE_REPAIR',
  'ON_REQUEST',
  'ACTIVE',
  'PUBLIC',
  'XK',
  'Prishtinë',
  ARRAY['REPAIRABLE', 'ZERO_WASTE'],
  ARRAY['riparim', 'elektronikë', 'laptop', 'telefon']
);
```

---

## 2. Si do të shtojnë listings përdoruesit në EcoHub (UI e aplikacionit)

**SHËNIM**: Kjo është flow-i i ardhshëm që do të implementohet në UI. Aktualisht përdoret vetëm metoda e Supabase më sipër.

### Flow-i i Planifikuar për Përdoruesit:

#### Hapi 1: Hyrja në formën e krijimit
1. Përdoruesi duhet të jetë i kyçur
2. Klikon butonin **"Shto Ofertë"** / **"Create Listing"** në `/sq/marketplace-v2`
3. Hapet faqja `/sq/marketplace-v2/add`

#### Hapi 2: Zgjedhja e llojit të listing-ut
Përdoruesi zgjedh njërin prej këtyre:
- 🔵 **Ofroj Material** (p.sh. alumin, plastikë, letër)
- 🟢 **Ofroj Produkt të Ricikluar** (p.sh. mobilje, rroba)
- 🔵 **Kërkojë Material** (bizneset që kanë nevojë për material të caktuar)
- 🟩 **Ofroj Shërbim** (p.sh. riparim, grumbullim, riciklim)

#### Hapi 3: Plotëso informacionin bazë
- **Titulli** - emri i shkurtër (p.sh. "Alumin i ricikluar - Prishtinë")
- **Kategoria** - dropdown me kategoritë (Metale, Plastika, Mobilje, etj.)
- **Përshkrimi** - detaje të plota (çfarë është, në çfarë gjendje, etj.)
- **Vendndodhja** - qyteti dhe regjioni
- **Sasia** (opsionale) - sa keni (p.sh. 500 kg, 10 copë)

#### Hapi 4: Çmimi
Zgjedh njërin:
- **Çmim fiks** → vendos çmimin në EUR
- **Falas** → për donacione
- **Me negocim** → çmimi diskutohet
- **Sipas kërkesës** → for shërbime

#### Hapi 5: Shtoni etiketa eco
Përdoruesi zgjedh nga lista:
- ✓ Material i ricikluar
- ✓ Upcycled (ripërdorur kreativishi)
- ✓ I riprueshëm
- ✓ Zero waste
- ✓ Vendor
- ✓ Plastikë-free
- ✓ Biodegradable

#### Hapi 6: Foto (opsionale, në të ardhmen)
- Upload deri në 5 foto
- Foto kryesore shënohet automatikisht

#### Hapi 7: Publikimi
1. Klikon **"Publiko Shpalljen"**
2. Listing-u kalon në **Draft** ose **Active** varësisht nga statusit e user-it:
   - Përdorues të verifikuar → shfaqet menjëherë
   - Përdorues të rinj → kalon review nga admin
3. Përdoruesi ridrejtohet te faqja e listing-ut të ri

---

### Menaxhimi i Listing-eve Ekzistuese (E ardhshme)

Përdoruesit do të mund të:
1. **Shohin listings-et e tyre** → `/sq/dashboard/listings`
2. **Editojnë** → klikojnë "Edit" dhe ndryshojnë detajet
3. **Arkivojnë** → kur shisni ose s'ka më (shfaqet si "Sold")
4. **Fshijnë** → heqin listing-un përgjithmonë

---

## 3. Best Practices për Admin (Ti!)

### Kontrolle të rregullta:
1. **Çdo javë**: Kontrollo dashboard-in e Supabase për listings të reja që presin aprovim
2. **Çdo muaj**: Pastro listings të vjetra/inaktive (ato që janë Draft > 30 ditë)

### Kur aprovohet një listing:
1. Kontrollo që:
   - Titulli dhe përshkrimi janë realë (jo spam)
   - Vendndodhja është në Kosovë
   - Eco labels janë të sakta
   - Nuk ka përmbajtje të papërshtatshme
2. Ndrysho **verification_status** nga `UNVERIFIED` → `VERIFIED`
3. Ndrysho **status** nga `DRAFT` → `ACTIVE` (nëse është e drafuar)

### Kur refuzon një listing:
1. Ndrysho **status** → `REJECTED`
2. (Në të ardhmen: dërgo email përdoruesit me arsyen)

---

## 4. Zgjidhja e Problemeve të Zakonshme

### Problem: Listing-u nuk shfaqet në marketplace

**Shkaqe të mundshme**:
1. **Status** nuk është `ACTIVE`
   - Zgjidhje: Ndrysho status → `ACTIVE` në Supabase
2. **Visibility** nuk është `PUBLIC`
   - Zgjidhje: Ndrysho visibility → `PUBLIC`
3. **Category ID** nuk ekziston
   - Zgjidhje: Kopjo një category ID të vlefshëm nga `eco_categories`
4. **Created_by_user_id** nuk ekziston
   - Zgjidhje: Kopjo një user ID të vlefshëm nga `users`

### Problem: Eco labels nuk shfaqen

**Shkak**: Sintaksë e gabuar në array
- ❌ E gabuar: `['RECYCLED']` ose `{"RECYCLED"}`
- ✅ E saktë: `ARRAY['RECYCLED_CONTENT', 'LOCAL']`

### Problem: Çmimi nuk shfaqet

**Shkaqe**:
1. **price** është NULL dhe **pricing_type** është `FIXED`
   - Zgjidhje: Vendos një çmim ose ndrysho në `ON_REQUEST`
2. **pricing_type** është `FREE`
   - Kjo është OK, duhet të shfaqet "Falas"

---

## 5. Referencë të Shpejta

### Flow Types të Valide:
```
OFFER_WASTE
OFFER_MATERIAL
OFFER_RECYCLED_PRODUCT
REQUEST_MATERIAL
SERVICE_REPAIR
SERVICE_REFURBISH
SERVICE_COLLECTION
SERVICE_CONSULTING
SERVICE_OTHER
```

### Pricing Types të Valide:
```
FIXED       - Çmim fiks
NEGOTIABLE  - Me negocim
FREE        - Falas
BARTER      - Shkëmbim
ON_REQUEST  - Sipas kërkesës
```

### Eco Labels të Valide:
```
RECYCLED_CONTENT  - Përmbajtje e ricikluar
UPCYCLED         - Upcycled (ripërdorur kreativish)
REPAIRABLE       - I riprueshëm
LOCAL            - Vendor
ZERO_WASTE       - Zero waste
```

### Status të Valide:
```
DRAFT      - Draft (jo e publikuar ende)
ACTIVE     - Aktiv (shfaqet në marketplace)
SOLD       - Shitur
FULFILLED  - Përmbushur (për shërbime)
ARCHIVED   - Arkivuar
REJECTED   - Refuzuar
```

---

**Nëse ke pyetje shtesë, kontakto zhvilluesin teknik të EcoHub!** 🌱
