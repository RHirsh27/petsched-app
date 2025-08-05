const db = require('../config/database');

const createUsersTable = async () => {
  try {
    // Create users table
    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'vet', 'client')),
        clinic_id TEXT,
        refresh_token TEXT,
        email_verified BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create clinics table for multi-tenancy
    await db.run(`
      CREATE TABLE IF NOT EXISTS clinics (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT,
        phone TEXT,
        email TEXT,
        website TEXT,
        subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'professional', 'enterprise')),
        subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add clinic_id foreign key to pets table
    await db.run(`
      ALTER TABLE pets ADD COLUMN clinic_id TEXT REFERENCES clinics(id)
    `);

    // Add clinic_id foreign key to appointments table
    await db.run(`
      ALTER TABLE appointments ADD COLUMN clinic_id TEXT REFERENCES clinics(id)
    `);

    // Add user_id to pets table for ownership
    await db.run(`
      ALTER TABLE pets ADD COLUMN user_id TEXT REFERENCES users(id)
    `);

    // Add user_id to appointments table for ownership
    await db.run(`
      ALTER TABLE appointments ADD COLUMN user_id TEXT REFERENCES users(id)
    `);

    console.log('✅ Users and clinics tables created successfully');
  } catch (error) {
    console.error('❌ Error creating users table:', error);
    throw error;
  }
};

module.exports = createUsersTable; 