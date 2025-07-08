-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    emri_i_plotë TEXT NOT NULL,
    email TEXT NOT NULL,
    vendndodhja TEXT NOT NULL,
    roli TEXT NOT NULL CHECK (roli IN ('Individ', 'Admin')),
    eshte_aprovuar BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emri TEXT NOT NULL,
    pershkrimi TEXT NOT NULL,
    interesi_primar TEXT NOT NULL,
    person_kontakti TEXT NOT NULL,
    email_kontakti TEXT NOT NULL,
    vendndodhja TEXT NOT NULL,
    lloji TEXT NOT NULL CHECK (lloji IN ('OJQ', 'Ndërmarrje Sociale', 'Kompani')),
    eshte_aprovuar BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create organization_members table
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    roli_ne_organizate TEXT NOT NULL,
    eshte_aprovuar BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- Create artikuj table (Knowledge Hub)
CREATE TABLE IF NOT EXISTS artikuj (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulli TEXT NOT NULL,
    përmbajtja TEXT NOT NULL,
    autori_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    eshte_publikuar BOOLEAN DEFAULT FALSE,
    kategori TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    foto_kryesore TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tregu_listime table (Marketplace)
CREATE TABLE IF NOT EXISTS tregu_listime (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    titulli TEXT NOT NULL,
    pershkrimi TEXT NOT NULL,
    kategori TEXT NOT NULL,
    çmimi NUMERIC(10,2) NOT NULL,
    njesia TEXT NOT NULL,
    vendndodhja TEXT NOT NULL,
    sasia TEXT NOT NULL,
    lloji_listimit TEXT NOT NULL CHECK (lloji_listimit IN ('shes', 'blej')),
    eshte_aprovuar BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_roli ON users(roli);
CREATE INDEX IF NOT EXISTS idx_organizations_approved ON organizations(eshte_aprovuar);
CREATE INDEX IF NOT EXISTS idx_organizations_lloji ON organizations(lloji);
CREATE INDEX IF NOT EXISTS idx_artikuj_published ON artikuj(eshte_publikuar);
CREATE INDEX IF NOT EXISTS idx_artikuj_kategori ON artikuj(kategori);
CREATE INDEX IF NOT EXISTS idx_tregu_approved ON tregu_listime(eshte_aprovuar);
CREATE INDEX IF NOT EXISTS idx_tregu_lloji ON tregu_listime(lloji_listimit);
CREATE INDEX IF NOT EXISTS idx_tregu_kategori ON tregu_listime(kategori);
