import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Starting seed 1000 users...');
    
    // Get the CUSTOMER role id
    const roleRes = await client.query("SELECT id_role FROM roles WHERE code = 'CUSTOMER'");
    if (roleRes.rows.length === 0) {
      throw new Error('CUSTOMER role not found. Please run migrations first.');
    }
    const customerRoleId = roleRes.rows[0].id_role;

    const passwordHash = await bcrypt.hash('password123', 10);
    
    await client.query('BEGIN');

    for (let i = 1; i <= 1000; i++) {
      const idUser = uuidv4();
      const email = `perf_test_${i}_${Date.now()}@example.com`;
      const fullName = `Perf Test User ${i}`;
      
      // Insert user
      await client.query(
        'INSERT INTO users (id_user, email, full_name, password_hash, status) VALUES ($1, $2, $3, $4, $5)',
        [idUser, email, fullName, passwordHash, 'active']
      );

      // Assign role
      await client.query(
        'INSERT INTO role_detail (id_role, id_user) VALUES ($1, $2)',
        [customerRoleId, idUser]
      );

      if (i % 100 === 0) {
        console.log(`Inserted ${i} users...`);
      }
    }

    await client.query('COMMIT');
    console.log('Successfully seeded 1000 users for performance testing.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding data:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
