const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

// Only require sqlite3 in development
let sqlite3 = null;
if (process.env.NODE_ENV !== 'production') {
  try {
    sqlite3 = require('sqlite3').verbose();
  } catch (error) {
    console.log('SQLite3 not available, using PostgreSQL only');
  }
}

class Database {
  constructor() {
    // In production, always use PostgreSQL
    this.useSQLite = process.env.NODE_ENV !== 'production' && 
                     process.env.USE_SQLITE === 'true' && 
                     sqlite3 !== null;
    this.connection = null;
  }

  async connect() {
    if (this.useSQLite) {
      return this.connectSQLite();
    } else {
      return this.connectPostgreSQL();
    }
  }

  connectSQLite() {
    return new Promise((resolve, reject) => {
      if (!sqlite3) {
        reject(new Error('SQLite3 not available'));
        return;
      }
      
      const dbPath = process.env.SQLITE_PATH || path.join(__dirname, '../database.sqlite');
      this.connection = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error connecting to SQLite:', err);
          reject(err);
        } else {
          console.log('✅ Connected to SQLite database');
          resolve();
        }
      });
    });
  }

  connectPostgreSQL() {
    return new Promise((resolve, reject) => {
      if (!process.env.DATABASE_URL) {
        reject(new Error('DATABASE_URL not set'));
        return;
      }

      this.connection = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      this.connection.on('connect', () => {
        console.log('✅ Connected to PostgreSQL database');
        resolve();
      });

      this.connection.on('error', (err) => {
        console.error('PostgreSQL connection error:', err);
        reject(err);
      });
    });
  }

  async query(sql, params = []) {
    if (this.useSQLite) {
      return this.sqliteQuery(sql, params);
    } else {
      return this.postgresQuery(sql, params);
    }
  }

  sqliteQuery(sql, params) {
    return new Promise((resolve, reject) => {
      if (!this.connection) {
        reject(new Error('Database not connected'));
        return;
      }
      
      this.connection.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async postgresQuery(sql, params) {
    try {
      const result = await this.connection.query(sql, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async run(sql, params = []) {
    if (this.useSQLite) {
      return this.sqliteRun(sql, params);
    } else {
      return this.postgresRun(sql, params);
    }
  }

  sqliteRun(sql, params) {
    return new Promise((resolve, reject) => {
      if (!this.connection) {
        reject(new Error('Database not connected'));
        return;
      }
      
      this.connection.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async postgresRun(sql, params) {
    try {
      const result = await this.connection.query(sql, params);
      return { id: result.rows[0]?.id, changes: result.rowCount };
    } catch (error) {
      throw error;
    }
  }

  async close() {
    if (this.connection) {
      if (this.useSQLite) {
        this.connection.close();
      } else {
        await this.connection.end();
      }
    }
  }
}

module.exports = new Database();
