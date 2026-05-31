const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const SCHEMA_PATH = path.resolve(__dirname, "..", "..", "sql", "schema.sql");
const SEED_PATH = path.resolve(__dirname, "..", "..", "sql", "seed.sql");

const initializeDatabase = async () => {
  const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  const dbHost = process.env.DB_HOST || "localhost";
  const dbPort = parseInt(process.env.DB_PORT, 10) || 3306;
  const dbUser = process.env.DB_USER || "root";
  const dbPassword = process.env.DB_PASSWORD || "";
  const dbName = process.env.DB_NAME || "clms_db";
  const pool = mysql.createPool({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  const seed = fs.readFileSync(SEED_PATH, "utf8");
  try {
    const connection = await pool.getConnection();
    await connection.query(schema);
    await connection.query(seed);
    connection.release();
    console.log("[bootstrap] Seed complete.");
  } catch (err) {
    if (err && (err.code === "ER_DUP_ENTRY" || err.errno === 1062)) {
      console.log("[bootstrap] Seed skipped (already exists).");
      return;
    }
    throw err;
  } finally {
    await pool.end();
  }
};

module.exports = { initializeDatabase };
