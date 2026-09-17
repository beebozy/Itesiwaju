import postgres from "postgres";
import "dotenv/config";

async function testDatabase() {
  const sql = postgres(process.env.DATABASE_URL!, {
    prepare: false,
  });

  try {
    const result = await sql`
      SELECT current_database(), current_schema();
    `;

    console.log(result);
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error);
  } finally {
    await sql.end();
  }
}

testDatabase();