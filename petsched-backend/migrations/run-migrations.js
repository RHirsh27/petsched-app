const db = require('../config/database');
const createUsersTable = require('./001_create_users_table');

const migrations = [
  { name: '001_create_users_table', fn: createUsersTable }
];

const runMigrations = async () => {
  try {
    console.log('🔄 Starting database migrations...');
    
    // Connect to database
    await db.connect();
    
    // Create migrations table to track executed migrations
    await db.run(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get executed migrations
    const executedMigrations = await db.query('SELECT name FROM migrations');
    const executedNames = executedMigrations.map(m => m.name);

    // Run pending migrations
    for (const migration of migrations) {
      if (!executedNames.includes(migration.name)) {
        console.log(`🔄 Running migration: ${migration.name}`);
        await migration.fn();
        
        // Mark migration as executed
        await db.run('INSERT INTO migrations (name) VALUES (?)', [migration.name]);
        console.log(`✅ Migration completed: ${migration.name}`);
      } else {
        console.log(`⏭️  Migration already executed: ${migration.name}`);
      }
    }

    console.log('🎉 All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations; 