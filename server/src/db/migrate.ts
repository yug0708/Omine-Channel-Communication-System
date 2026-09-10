import { initDb, pool } from './index.js';

async function runMigration() {
  console.log('🔄 Starting database migration...');
  console.log(`📡 Connecting to database target: ${process.env.DATABASE_URL ? '(Configured)' : '(MISSING!)'}`);
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL is required to run migrations.');
    process.exit(1);
  }

  try {
    await initDb();
    
    // Quick validation query
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📋 Existing tables in database:');
    res.rows.forEach((row: { table_name: string }) => console.log(`   - ${row.table_name}`));
    
    const tenantCount = await pool.query('SELECT COUNT(*) FROM tenants');
    console.log(`👥 Registered tenants/users in database: ${tenantCount.rows[0].count}`);
    
    console.log('🎉 Database migration and verification completed successfully!');
  } catch (err: any) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
