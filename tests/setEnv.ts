// Ensure unit tests use a lightweight SQLite DB when an integration DB is not in use.
if (process.env.SKIP_INTEGRATION || !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./test.db';
}
