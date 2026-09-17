import postgres from "postgres";
import "dotenv/config";

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, {
    prepare: false,
  });

  const result = await sql`
    SELECT
      column_name,
      data_type,
      is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
    ORDER BY ordinal_position;
  `;

  console.table(result);

  await sql.end();
}

main();