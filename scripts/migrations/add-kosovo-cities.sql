-- Create cities table for Kosovo towns and cities
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_sq TEXT NOT NULL,
  name_en TEXT NOT NULL,
  municipality TEXT,
  region TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert main Kosovo cities and towns
INSERT INTO cities (name_sq, name_en, region, display_order) VALUES
-- Major Cities (display first)
('Prishtinë', 'Pristina', 'Prishtinë', 1),
('Prizren', 'Prizren', 'Prizren', 2),
('Pejë', 'Peja', 'Pejë', 3),
('Gjakovë', 'Gjakova', 'Gjakovë', 4),
('Ferizaj', 'Ferizaj', 'Ferizaj', 5),
('Gjilan', 'Gjilan', 'Gjilan', 6),
('Mitrovicë', 'Mitrovica', 'Mitrovicë', 7),

-- Other Cities and Towns (alphabetical)
('Deçan', 'Decan', 'Pejë', 10),
('Dragash', 'Dragash', 'Prizren', 11),
('Fushë Kosovë', 'Fushe Kosova', 'Prishtinë', 12),
('Gllogoc', 'Gllogoc', 'Prishtinë', 13),
('Graçanicë', 'Gracanica', 'Prishtinë', 14),
('Hani i Elezit', 'Hani i Elezit', 'Ferizaj', 15),
('Istog', 'Istog', 'Pejë', 16),
('Kaçanik', 'Kacanik', 'Ferizaj', 17),
('Kamenicë', 'Kamenica', 'Gjilan', 18),
('Klinë', 'Klina', 'Pejë', 19),
('Lipjan', 'Lipjan', 'Prishtinë', 20),
('Malishevë', 'Malisheva', 'Gjakovë', 21),
('Mamushë', 'Mamusha', 'Prizren', 22),
('Novobërdë', 'Novoberde', 'Gjilan', 23),
('Obiliq', 'Obiliq', 'Prishtinë', 24),
('Partesh', 'Partesh', 'Gjilan', 25),
('Podujevë', 'Podujeva', 'Prishtinë', 26),
('Rahovec', 'Rahovec', 'Gjakovë', 27),
('Ranillug', 'Ranillug', 'Gjilan', 28),
('Shtërpcë', 'Shtrpce', 'Ferizaj', 29),
('Shtimë', 'Shtime', 'Prishtinë', 30),
('Skenderaj', 'Skenderaj', 'Mitrovicë', 31),
('Suharekë', 'Suhareka', 'Prizren', 32),
('V iti', 'Viti', 'Gjilan', 33),
('Vushtrri', 'Vushtrri', 'Mitrovicë', 34),
('Zubin Potok', 'Zubin Potok', 'Mitrovicë', 35),
('Zveçan', 'Zvecan', 'Mitrovicë', 36);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cities_name_sq ON cities(name_sq);
CREATE INDEX IF NOT EXISTS idx_cities_region ON cities(region);
CREATE INDEX IF NOT EXISTS idx_cities_display_order ON cities(display_order);
CREATE INDEX IF NOT EXISTS idx_cities_is_active ON cities(is_active) WHERE is_active = true;

