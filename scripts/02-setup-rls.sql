-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE artikuj ENABLE ROW LEVEL SECURITY;
ALTER TABLE tregu_listime ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (id = auth.uid() AND roli = OLD.roli AND eshte_aprovuar = OLD.eshte_aprovuar);

CREATE POLICY "Anyone can insert user profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Organizations policies
CREATE POLICY "Anyone can view approved organizations" ON organizations
    FOR SELECT USING (eshte_aprovuar = true);

CREATE POLICY "Admins can view all organizations" ON organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.roli = 'Admin'
        )
    );

CREATE POLICY "Users can insert organizations" ON organizations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Organization members can update their organization" ON organizations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_members.organization_id = organizations.id 
            AND organization_members.user_id = auth.uid()
            AND organization_members.eshte_aprovuar = true
        )
    );

CREATE POLICY "Admins can update organizations" ON organizations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.roli = 'Admin'
        )
    );

CREATE POLICY "Admins can delete organizations" ON organizations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.roli = 'Admin'
        )
    );

-- Organization members policies
CREATE POLICY "Users can view their own memberships" ON organization_members
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert memberships" ON organization_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Articles policies
CREATE POLICY "Anyone can view published articles" ON artikuj
    FOR SELECT USING (eshte_publikuar = true);

CREATE POLICY "Admins can view all articles" ON artikuj
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.roli = 'Admin'
        )
    );

CREATE POLICY "Users can insert articles" ON artikuj
    FOR INSERT WITH CHECK (autori_id = auth.uid());

CREATE POLICY "Authors can update their articles" ON artikuj
    FOR UPDATE USING (autori_id = auth.uid());

CREATE POLICY "Admins can update articles" ON artikuj
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.roli = 'Admin'
        )
    );

CREATE POLICY "Admins can delete articles" ON artikuj
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.roli = 'Admin'
        )
    );

-- Marketplace listings policies
CREATE POLICY "Anyone can view approved listings" ON tregu_listime
    FOR SELECT USING (eshte_aprovuar = true);

CREATE POLICY "Admins can view all listings" ON tregu_listime
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.roli = 'Admin'
        )
    );

CREATE POLICY "Users can insert listings" ON tregu_listime
    FOR INSERT WITH CHECK (created_by_user_id = auth.uid());

CREATE POLICY "Users can update their listings" ON tregu_listime
    FOR UPDATE USING (created_by_user_id = auth.uid());

CREATE POLICY "Admins can update listings" ON tregu_listime
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.roli = 'Admin'
        )
    );

CREATE POLICY "Admins can delete listings" ON tregu_listime
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.roli = 'Admin'
        )
    );
