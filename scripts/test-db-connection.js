const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const dbUrl = process.env.SUPABASE_DB_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Environment check:");
console.log("- NEXT_PUBLIC_SUPABASE_URL:", url ? "✓" : "✗");
console.log("- NEXT_PUBLIC_SUPABASE_ANON_KEY:", anonKey ? "✓" : "✗");
console.log("- SUPABASE_DB_URL:", dbUrl ? "✓" : "✗");
console.log("- SUPABASE_SERVICE_ROLE_KEY:", serviceRole ? "✓" : "✗");

if (!url || !serviceRole) {
  console.log("\n✗ Missing required environment variables");
  process.exit(1);
}

// Create a Supabase client for server operations
const supabase = createClient(url, serviceRole);

(async () => {
  try {
    console.log("\nAttempting to query users table...");
    const { data, error } = await supabase
      .from("users")
      .select("id, emri_i_plote, email")
      .limit(1);

    if (error) {
      console.log("✗ Query error:", error.message);
      process.exit(1);
    }

    console.log("✓ Query successful!");
    console.log("- Found", data.length, "user(s)");
    if (data.length > 0) {
      console.log("- Sample:", data[0]);
    }
  } catch (err) {
    console.log("✗ Connection error:", err.message);
    process.exit(1);
  }
})();
