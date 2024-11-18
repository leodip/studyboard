// server/db/migrations/002_add_optional_status.js

import { getDb } from '../index.js';

export async function up() {
    const db = await getDb();
    try {
        console.log('Running migration 002: Adding optional status');

        // Start transaction
        await db.exec('BEGIN TRANSACTION');

        // Create new activities table with updated constraint
        await db.exec(`
            CREATE TABLE activities_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subjectId INTEGER NOT NULL,
                description TEXT NOT NULL,
                status TEXT CHECK(status IN ('pending', 'partially_done', 'done', 'optional')) DEFAULT 'pending',
                comments TEXT,
                dueDate DATETIME,
                dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
                dateUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (subjectId) REFERENCES subjects(id)
            );
        `);

        // Copy data from old table to new table
        await db.exec(`
            INSERT INTO activities_new 
            SELECT * FROM activities;
        `);

        // Drop old table
        await db.exec('DROP TABLE activities;');

        // Rename new table to original name
        await db.exec('ALTER TABLE activities_new RENAME TO activities;');

        // Recreate indexes
        await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_activities_subjectId ON activities(subjectId);
            CREATE INDEX IF NOT EXISTS idx_activities_dueDate ON activities(dueDate);
            CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
        `);

        // Recreate the activity update trigger
        await db.exec(`
            CREATE TRIGGER IF NOT EXISTS update_activity_timestamp 
            AFTER UPDATE ON activities
            BEGIN
                UPDATE activities SET dateUpdated = CURRENT_TIMESTAMP
                WHERE id = NEW.id;
            END;
        `);

        // Commit transaction
        await db.exec('COMMIT');

        console.log('Migration 002 completed successfully');
    } catch (error) {
        // Rollback on error
        await db.exec('ROLLBACK');
        console.error('Migration 002 failed:', error);
        throw error;
    } finally {
        await db.close();
    }
}

export async function down() {
    const db = await getDb();
    try {
        await db.exec('BEGIN TRANSACTION');

        // Create new activities table with original constraint
        await db.exec(`
            CREATE TABLE activities_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subjectId INTEGER NOT NULL,
                description TEXT NOT NULL,
                status TEXT CHECK(status IN ('pending', 'partially_done', 'done')) DEFAULT 'pending',
                comments TEXT,
                dueDate DATETIME,
                dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
                dateUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (subjectId) REFERENCES subjects(id)
            );
        `);

        // Copy data, converting 'optional' status to 'pending'
        await db.exec(`
            INSERT INTO activities_new 
            SELECT 
                id,
                subjectId,
                description,
                CASE WHEN status = 'optional' THEN 'pending' ELSE status END,
                comments,
                dueDate,
                dateCreated,
                dateUpdated
            FROM activities;
        `);

        // Drop old table
        await db.exec('DROP TABLE activities;');

        // Rename new table to original name
        await db.exec('ALTER TABLE activities_new RENAME TO activities;');

        // Recreate indexes
        await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_activities_subjectId ON activities(subjectId);
            CREATE INDEX IF NOT EXISTS idx_activities_dueDate ON activities(dueDate);
            CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
        `);

        // Recreate the activity update trigger
        await db.exec(`
            CREATE TRIGGER IF NOT EXISTS update_activity_timestamp 
            AFTER UPDATE ON activities
            BEGIN
                UPDATE activities SET dateUpdated = CURRENT_TIMESTAMP
                WHERE id = NEW.id;
            END;
        `);

        await db.exec('COMMIT');
    } catch (error) {
        await db.exec('ROLLBACK');
        throw error;
    } finally {
        await db.close();
    }
}