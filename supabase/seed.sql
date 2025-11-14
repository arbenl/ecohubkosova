-- Optional seed data pulled from scripts/03-seed-data.sql.
-- Run automatically when executing `supabase db reset`.

insert into organizations (emri, pershkrimi, interesi_primar, person_kontakti, email_kontakti, vendndodhja, lloji, eshte_aprovuar) values
('Qendra për Ekonomi Qarkulluese', 'Organizatë që promovon ekonominë qarkulluese në Kosovë', 'Ekonomi qarkulluese', 'Arben Krasniqi', 'info@ceq.org', 'Prishtinë, Kosovë', 'OJQ', true),
('EcoTech Solutions', 'Kompani që ofron zgjidhje teknologjike për qëndrueshmëri', 'Teknologji e gjelbër', 'Blerta Hoxha', 'contact@ecotech.co', 'Prizren, Kosovë', 'Kompani', true),
('Green Future Kosovo', 'Ndërmarrje sociale për projekte të gjelbra', 'Energji e ripërtëritshme', 'Driton Berisha', 'hello@greenfuture.org', 'Pejë, Kosovë', 'Ndërmarrje Sociale', true),
('Reciklimi Plus', 'Kompani për riciklim dhe menaxhim mbetjesh', 'Riciklim', 'Fatmire Gashi', 'info@reciklimi.com', 'Gjilan, Kosovë', 'Kompani', true),
('Bujqësia e Qëndrueshme', 'OJQ për promovimin e bujqësisë organike', 'Bujqësi e qëndrueshme', 'Mentor Kelmendi', 'contact@bujqesia.org', 'Ferizaj, Kosovë', 'OJQ', true);

insert into artikuj (titulli, permbajtja, autori_id, eshte_publikuar, kategori, tags) values
('Hyrje në Ekonominë Qarkulluese', 'Ekonomia qarkulluese është një model ekonomik që synon eliminimin e mbetjeve dhe përdorimin e vazhdueshëm të burimeve. Ky artikull shpjegon parimet bazë të ekonomisë qarkulluese dhe përfitimet e saj për mjedisin dhe ekonominë.', (select id from users where roli = 'Admin' limit 1), true, 'Ekonomi qarkulluese', array['ekonomi', 'qëndrueshmëri', 'mjedis']),
('Riciklimi në Kosovë: Sfidat dhe Mundësitë', 'Analiza e gjendjes aktuale të riciklimit në Kosovë, sfidat kryesore dhe mundësitë për përmirësim. Artikulli përfshin rekomandime për politikëbërësit dhe qytetarët.', (select id from users where roli = 'Admin' limit 1), true, 'Riciklim', array['riciklim', 'Kosovë', 'politika']),
('Energjia e Ripërtëritshme: E Ardhmja e Kosovës', 'Potenciali i Kosovës për energji të ripërtëritshme, duke përfshirë energjinë diellore, erën dhe hidro. Diskutohen investimet e nevojshme dhe përfitimet ekonomike.', (select id from users where roli = 'Admin' limit 1), true, 'Energji e ripërtëritshme', array['energji', 'diell', 'erë']);

insert into tregu_listime (created_by_user_id, titulli, pershkrimi, kategori, cmimi, njesia, vendndodhja, sasia, lloji_listimit, eshte_aprovuar) values
((select id from users where roli = 'Admin' limit 1), 'Materiale plastike të riciklueshme', 'Plastikë e pastër PET dhe HDPE, e përshtatshme për riciklim. Materiali është i sortuar dhe i pastruar.', 'Materiale të riciklueshme', 0.50, 'kg', 'Prishtinë, Kosovë', '500-1000 kg', 'shes', true),
((select id from users where roli = 'Admin' limit 1), 'Panele diellore të përdorura', 'Panele diellore në gjendje të mirë, të përshtatshme për projekte të vogla. Efikasiteti 80% i kapacitetit origjinal.', 'Energji e ripërtëritshme', 150.00, 'copë', 'Prizren, Kosovë', '10-20 copë', 'shes', true),
((select id from users where roli = 'Admin' limit 1), 'Kërkoj materiale ndërtimi të ricikluara', 'Jam në kërkim të materialeve të ricikluara për ndërtim, siç janë tulla, beton i thyer, dhe materiale të tjera.', 'Materiale të riciklueshme', 20.00, 'ton', 'Mitrovicë, Kosovë', '5-10 ton', 'blej', true);
