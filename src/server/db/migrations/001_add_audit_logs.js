import { getDb } from '../index.js';

export async function up() {
    const db = await getDb();
    try {

        console.log('Running migration 001');

        await db.exec(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                user_email TEXT NOT NULL,
                action TEXT NOT NULL,
                entity_type TEXT NOT NULL,
                entity_id INTEGER NOT NULL,
                old_values TEXT,
                new_values TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_audit_logs_entity 
            ON audit_logs(entity_type, entity_id);

            CREATE INDEX IF NOT EXISTS idx_audit_logs_user 
            ON audit_logs(user_id);

            CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp 
            ON audit_logs(timestamp);
        `);
    } finally {
        await db.close();
    }

    console.log('Migration 001 run successfully');
}

export async function down() {
    const db = await getDb();
    try {
        await db.exec(`
            DROP TABLE IF EXISTS audit_logs;
        `);
    } finally {
        await db.close();
    }
}