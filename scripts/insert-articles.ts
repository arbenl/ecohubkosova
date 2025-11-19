import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const articles = [
  {
    title: 'Biodiversiteti i Kosovës dhe Konservimi',
    content: 'Kosova është shtëpia e një biodiversiteti të pasur me mbi 1800 lloje bimësh dhe 300 lloje shtazësh. Ky artikull eksploron zonat e mbrojtura, sfidat e biodiversitetit dhe iniciativat për konservimin e natyrës.',
    category: 'Biodiversitet',
    tags: ['biodiversitet', 'konservim', 'natyrë'],
    is_published: true
  },
  {
    title: 'Bujqësia e Qëndrueshme në Kosovë',
    content: 'Transformimi i bujqësisë kosovare drejt praktikave të qëndrueshme. Diskutohen teknikat organike, menaxhimi i ujit dhe përfitimet ekonomike për fermerët vendas.',
    category: 'Bujqësi e qëndrueshme',
    tags: ['bujqësi', 'organike', 'fermerë'],
    is_published: true
  },
  {
    title: 'Ndikimi i Ndryshimeve Klimatike në Kosovë',
    content: 'Analiza e efekteve të ndryshimeve klimatike në territorin e Kosovës, duke përfshirë thatësirën, përmbytjet dhe ndryshimet në mot. Propozojmë strategji për përshtatje dhe mitigim.',
    category: 'Ndryshimet klimatike',
    tags: ['klima', 'përshtatje', 'mitigim'],
    is_published: true
  },
  {
    title: 'Ndërmarrësi i Gjelbër: Oportunitetet në Kosovë',
    content: 'Udhëzues për fillimin e bizneseve të gjelbra në Kosovë. Përfshin ide biznesi, mbështetje financiare dhe tregjet për produktet e qëndrueshme.',
    category: 'Ndërmarrësi i gjelbër',
    tags: ['biznes', 'gjelbër', 'investime'],
    is_published: true
  },
  {
    title: 'Menaxhimi i Burimeve të Ujit në Kosovë',
    content: 'Gjendja e burimeve ujore në Kosovë dhe sfidat e menaxhimit të tyre. Diskutohen strategjitë për ruajtjen e ujit dhe përdorimin efikas të tij.',
    category: 'Menaxhimi i ujit',
    tags: ['ujë', 'burime', 'ruajtje'],
    is_published: true
  },
  {
    title: 'Qëndrueshmëria Urbane në Qytetet e Kosovës',
    content: 'Iniciativat për zhvillimin e qëndrueshëm urban në Prishtinë dhe qytetet e tjera. Përfshin transportin publik, ndërtimin e gjelbër dhe menaxhimin e mbetjeve urbane.',
    category: 'Qëndrueshmëria urbane',
    tags: ['qytet', 'transport', 'ndërtim'],
    is_published: true
  },
  {
    title: 'Edukim Ambiental për të Ardhmen e Kosovës',
    content: 'Rëndësia e edukimit ambiental në shkollat kosovare. Programe, aktivitete dhe materiale për rritjen e ndërgjegjësimit për mjedisin tek të rinjtë.',
    category: 'Edukim ambiental',
    tags: ['edukim', 'rinia', 'ndërgjegjësim'],
    is_published: true
  },
  {
    title: 'Energjia Diellore: Potenciali i Madh i Kosovës',
    content: 'Kosova ka një nga potencialet më të mëdha për energjinë diellore në rajon. Ky artikull analizon kushtet gjeografike dhe ekonomike për zhvillimin e këtij sektori.',
    category: 'Energji diellore',
    tags: ['diell', 'potencial', 'investime'],
    is_published: true
  },
  {
    title: 'Riciklimi i Plastikës: Një sfidë për Kosovën',
    content: 'Problemi i mbetjeve plastike në Kosovë dhe zgjidhjet për riciklimin e tyre. Përfshin teknologjitë moderne dhe praktikat më të mira ndërkombëtare.',
    category: 'Riciklim plastike',
    tags: ['plastikë', 'mbetje', 'teknologji'],
    is_published: true
  },
  {
    title: 'Pyjet e Kosovës dhe Rëndësia e tyre për Klimën',
    content: 'Pyjet kosovare si sink i karbonit dhe roli i tyre në luftën kundër ndryshimeve klimatike. Strategjitë për mbrojtjen dhe rigjallërimin e pyjeve.',
    category: 'Pyjet dhe klima',
    tags: ['pyje', 'karbon', 'rigjallërim'],
    is_published: true
  }
]

async function insertArticles() {
  try {
    // Get admin user ID
    const { data: adminUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'Admin')
      .limit(1)
      .single()

    if (userError || !adminUser) {
      console.error('Admin user not found:', userError)
      return
    }

    console.log('Found admin user:', adminUser.id)

    // Insert articles
    for (const article of articles) {
      const { data, error } = await supabase
        .from('artikuj')
        .insert({
          ...article,
          author_id: adminUser.id
        })
        .select()

      if (error) {
        console.error('Error inserting article:', article.title, error)
      } else {
        console.log('Inserted article:', article.title)
      }
    }

    console.log('All articles inserted successfully!')
  } catch (error) {
    console.error('Error:', error)
  }
}

insertArticles()