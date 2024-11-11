import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = './database.sqlite';

// Database connection helper
async function getDb() {
    return open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });
}

// Check if database exists
async function checkDatabaseExists() {
    try {
        await fs.access(DB_PATH);
        return true;
    } catch {
        return false;
    }
}

// Initialize database and create tables
async function initializeDatabase() {
    const exists = await checkDatabaseExists();

    if (exists) {
        console.log('Database already exists, skipping initialization');
        return;
    }

    console.log('Initializing new database...');

    const db = await getDb();

    try {
        // Begin transaction for atomic initialization
        await db.exec('BEGIN TRANSACTION');

        console.log('Creating subjects table...');
        await db.exec(`
            CREATE TABLE IF NOT EXISTS subjects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
                dateUpdated DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Creating activities table...');
        await db.exec(`
            CREATE TABLE IF NOT EXISTS activities (
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

        console.log('Creating messages_of_the_day table...');
        await db.exec(`
            CREATE TABLE IF NOT EXISTS messages_of_the_day (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message TEXT NOT NULL,
                author TEXT,
                link TEXT,
                dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
                dateUpdated DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Creating triggers...');
        await db.exec(`
            --Trigger to update dateUpdated on subjects
            CREATE TRIGGER IF NOT EXISTS update_subject_timestamp 
            AFTER UPDATE ON subjects
            BEGIN
                UPDATE subjects SET dateUpdated = CURRENT_TIMESTAMP
                WHERE id = NEW.id;
            END;

            --Trigger to update dateUpdated on activities
            CREATE TRIGGER IF NOT EXISTS update_activity_timestamp 
            AFTER UPDATE ON activities
            BEGIN
                UPDATE activities SET dateUpdated = CURRENT_TIMESTAMP
                WHERE id = NEW.id;
            END;

            -- Trigger to update dateUpdated on messages_of_the_day
            CREATE TRIGGER IF NOT EXISTS update_motd_timestamp 
            AFTER UPDATE ON messages_of_the_day
            BEGIN
                UPDATE messages_of_the_day SET dateUpdated = CURRENT_TIMESTAMP
                WHERE id = NEW.id;
            END;
        `);

        // Create indexes for better performance
        console.log('Creating indexes...');
        await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_activities_subjectId ON activities(subjectId);
            CREATE INDEX IF NOT EXISTS idx_activities_dueDate ON activities(dueDate);
            CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
        `);

        // Commit transaction
        await db.exec('COMMIT');
        console.log('Database initialization completed successfully');

    } catch (error) {
        // Rollback transaction on error
        await db.exec('ROLLBACK');
        console.error('Database initialization failed:', error);
        throw error;
    } finally {
        await db.close();
    }
}

// Check database health
async function checkDatabaseHealth() {
    const db = await getDb();
    try {
        // Verify tables exist
        const tables = await db.all(`
            SELECT name FROM sqlite_master 
            WHERE type = 'table' 
            AND name IN('subjects', 'activities')
            `);

        const hasAllTables = tables.length === 2;

        // Verify triggers exist
        const triggers = await db.all(`
            SELECT name FROM sqlite_master 
            WHERE type = 'trigger' 
            AND name IN('update_subject_timestamp', 'update_activity_timestamp')
        `);

        const hasAllTriggers = triggers.length === 2;

        return {
            healthy: hasAllTables && hasAllTriggers,
            tables: tables.map(t => t.name),
            triggers: triggers.map(t => t.name)
        };
    } finally {
        await db.close();
    }
}

// Subject operations
async function createSubject(name) {
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO subjects (name) VALUES (?)',
        [name]
    );
    await db.close();
    return result.lastID;
}

async function getSubject(id) {
    const db = await getDb();
    const subject = await db.get(
        'SELECT * FROM subjects WHERE id = ?',
        [id]
    );
    await db.close();
    return subject;
}

async function getAllSubjects() {
    const db = await getDb();
    const subjects = await db.all('SELECT * FROM subjects ORDER BY name');
    await db.close();
    return subjects;
}

async function updateSubject(id, name) {
    const db = await getDb();
    await db.run(
        'UPDATE subjects SET name = ? WHERE id = ?',
        [name, id]
    );
    await db.close();
}

async function deleteSubject(id) {
    const db = await getDb();
    await db.run('DELETE FROM subjects WHERE id = ?', [id]);
    await db.close();
}

// Activity operations
async function createActivity(subjectId, description, dueDate, comments = null) {
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO activities (subjectId, description, dueDate, comments) VALUES (?, ?, ?, ?)',
        [subjectId, description, dueDate, comments]
    );
    await db.close();
    return result.lastID;
}

async function getActivity(id) {
    const db = await getDb();
    const activity = await db.get(
        'SELECT * FROM activities WHERE id = ?',
        [id]
    );
    await db.close();
    return activity;
}

async function getActivitiesBySubject(subjectId) {
    const db = await getDb();
    const activities = await db.all(
        'SELECT * FROM activities WHERE subjectId = ? ORDER BY dueDate, dateCreated',
        [subjectId]
    );
    await db.close();
    return activities;
}

async function updateActivity(id, updates) {
    const db = await getDb();
    const { description, status, dueDate, comments } = updates;

    await db.run(
        `UPDATE activities 
         SET description = COALESCE(?, description),
            status = COALESCE(?, status),
            dueDate = COALESCE(?, dueDate),
            comments = COALESCE(?, comments)
         WHERE id = ? `,
        [description, status, dueDate, comments, id]
    );
    await db.close();
}

async function deleteActivity(id) {
    const db = await getDb();
    await db.run('DELETE FROM activities WHERE id = ?', [id]);
    await db.close();
}

// Helper queries
async function getUpcomingActivities(days = 7) {
    const db = await getDb();
    const activities = await db.all(
        `SELECT a.*, s.name as subjectName
         FROM activities a
         JOIN subjects s ON a.subjectId = s.id
         WHERE a.dueDate <= date('now', '+' || ? || ' days')
         AND a.status != 'done'
         ORDER BY a.dueDate`,
        [days]
    );
    await db.close();
    return activities;
}

async function getActivityStats() {
    const db = await getDb();
    const stats = await db.get(
        `SELECT
        COUNT(*) as total,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'partially_done' THEN 1 ELSE 0 END) as partiallyDone,
            SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed
         FROM activities`
    );
    await db.close();
    return stats;
}

async function createMessageOfTheDay(message, author = null, link = null) {
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO messages_of_the_day (message, author, link) VALUES (?, ?, ?)',
        [message, author, link]
    );
    await db.close();
    return result.lastID;
}

async function getMessageOfTheDay(id) {
    const db = await getDb();
    const message = await db.get(
        'SELECT * FROM messages_of_the_day WHERE id = ?',
        [id]
    );
    await db.close();
    return message;
}

async function getLatestMessageOfTheDay() {
    const db = await getDb();
    const message = await db.get(
        'SELECT * FROM messages_of_the_day ORDER BY dateCreated DESC LIMIT 1'
    );
    await db.close();
    return message;
}

async function getAllMessagesOfTheDay() {
    const db = await getDb();
    const messages = await db.all(
        'SELECT * FROM messages_of_the_day ORDER BY dateCreated DESC'
    );
    await db.close();
    return messages;
}

async function updateMessageOfTheDay(id, updates) {
    const db = await getDb();
    const { message, author, link } = updates;

    await db.run(
        `UPDATE messages_of_the_day 
         SET message = COALESCE(?, message),
             author = COALESCE(?, author),
             link = COALESCE(?, link)
         WHERE id = ?`,
        [message, author, link, id]
    );
    await db.close();
}

async function deleteMessageOfTheDay(id) {
    const db = await getDb();
    await db.run('DELETE FROM messages_of_the_day WHERE id = ?', [id]);
    await db.close();
}

export {
    initializeDatabase,
    checkDatabaseHealth,
    createSubject,
    getSubject,
    getAllSubjects,
    updateSubject,
    deleteSubject,
    createActivity,
    getActivity,
    getActivitiesBySubject,
    updateActivity,
    deleteActivity,
    getUpcomingActivities,
    getActivityStats,
    createMessageOfTheDay,
    getMessageOfTheDay,
    getLatestMessageOfTheDay,
    getAllMessagesOfTheDay,
    updateMessageOfTheDay,
    deleteMessageOfTheDay
};