import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

const connectionString =
  "postgresql://postgres.xjyseqtfuxcuviiankhy:1GnOqYqUeGiUf89v@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"
const client = postgres(connectionString)
const db = drizzle(client)

async function run() {
  const result = await client`SELECT email, role FROM public.users WHERE role = 'Admin' LIMIT 1;`
  console.log("Found admin:")
  console.log(result)

  // also get the admin password from auth.users (encrypted, just to see if it exists)
  if (result.length > 0) {
    const authUser =
      await client`SELECT email, id FROM auth.users WHERE email = ${result[0].email};`
    console.log("Auth user found:", authUser.length > 0)
  }

  process.exit(0)
}
run()
