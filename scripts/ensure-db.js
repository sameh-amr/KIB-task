// scripts/ensure-db.js
require('dotenv').config();
const { Client } = require('pg');

const {
  DATABASE_HOST: host,
  DATABASE_PORT: port = 5432,
  DATABASE_USER: user,
  DATABASE_PASSWORD: password,
  DATABASE_NAME,
} = process.env;

if (!DATABASE_NAME) {
  console.error('DATABASE_NAME is not set in .env');
  process.exit(1);
}

(async () => {
  // Connect to the default "postgres" DB to check/create target DB.
  const admin = new Client({ host, port: Number(port), user, password, database: 'postgres' });

  try {
    await admin.connect();

    const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [DATABASE_NAME]);
    if (exists.rowCount > 0) {
      console.log(`Database "${DATABASE_NAME}" already exists.`);
      return;
    }

    // Postgres has no "CREATE DATABASE IF NOT EXISTS" -> we check then create.
    const safeName = DATABASE_NAME.replace(/"/g, '""');
    await admin.query(`CREATE DATABASE "${safeName}"`);
    console.log(`Database "${DATABASE_NAME}" created.`);
  } catch (err) {
    console.error('Failed ensuring database existence:', err.message);
    process.exitCode = 1;
  } finally {
    await admin.end().catch(() => {});
  }
})();
