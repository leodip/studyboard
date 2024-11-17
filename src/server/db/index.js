import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs/promises';

const DB_PATH = './database.sqlite';

// Database connection helper
async function getDb() {
    return open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });
}

async function checkTablesExist(db) {
    const tables = await db.all(`
        SELECT name FROM sqlite_master 
        WHERE type = 'table'
    `);
    return tables.map(t => t.name);
}

async function initializeDatabase() {
    const db = await getDb();

    try {
        // Check which tables exist
        const existingTables = await checkTablesExist(db);
        console.log('Existing tables:', existingTables);

        // Begin transaction
        await db.exec('BEGIN TRANSACTION');

        // Create tables if they don't exist
        if (!existingTables.includes('subjects')) {
            console.log('Creating subjects table...');
            await db.exec(`
                CREATE TABLE IF NOT EXISTS subjects (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
                    dateUpdated DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `);
        }

        if (!existingTables.includes('activities')) {
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
        }

        if (!existingTables.includes('messages_of_the_day')) {
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
        }

        if (!existingTables.includes('audit_logs')) {
            console.log('Creating audit_logs table...');
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
            `);
        }

        // Create triggers if they don't exist
        console.log('Creating triggers...');
        await db.exec(`
            CREATE TRIGGER IF NOT EXISTS update_subject_timestamp 
            AFTER UPDATE ON subjects
            BEGIN
                UPDATE subjects SET dateUpdated = CURRENT_TIMESTAMP
                WHERE id = NEW.id;
            END;

            CREATE TRIGGER IF NOT EXISTS update_activity_timestamp 
            AFTER UPDATE ON activities
            BEGIN
                UPDATE activities SET dateUpdated = CURRENT_TIMESTAMP
                WHERE id = NEW.id;
            END;

            CREATE TRIGGER IF NOT EXISTS update_motd_timestamp 
            AFTER UPDATE ON messages_of_the_day
            BEGIN
                UPDATE messages_of_the_day SET dateUpdated = CURRENT_TIMESTAMP
                WHERE id = NEW.id;
            END;
        `);

        // Create indexes if they don't exist
        console.log('Creating indexes...');
        await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_activities_subjectId ON activities(subjectId);
            CREATE INDEX IF NOT EXISTS idx_activities_dueDate ON activities(dueDate);
            CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
            CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
            CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
            CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
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
            AND name IN('subjects', 'activities', 'messages_of_the_day', 'audit_logs')
        `);

        const hasAllTables = tables.length === 4;

        // Verify triggers exist
        const triggers = await db.all(`
            SELECT name FROM sqlite_master 
            WHERE type = 'trigger' 
            AND name IN('update_subject_timestamp', 'update_activity_timestamp', 'update_motd_timestamp')
        `);

        const hasAllTriggers = triggers.length === 3;

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
async function createActivity(subjectId, description, dueDate, status, comments = null) {
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO activities (subjectId, description, dueDate, status, comments) VALUES (?, ?, ?, ?, ?)',
        [subjectId, description, dueDate, status, comments]
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
         WHERE id = ?`,
        [description, status, dueDate, comments, id]
    );
    await db.close();
}

async function deleteActivity(id) {
    const db = await getDb();
    await db.run('DELETE FROM activities WHERE id = ?', [id]);
    await db.close();
}

// Message of the Day operations
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

// Audit log functions
async function createAuditLog(req, {
    action,
    entityType,
    entityId,
    oldValues = null,
    newValues = null
}) {
    const db = await getDb();
    try {
        const userId = req.session.user.idTokenClaims.sub;
        const userEmail = req.session.user.idTokenClaims.email;

        await db.run(
            `INSERT INTO audit_logs 
            (user_id, user_email, action, entity_type, entity_id, old_values, new_values)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                userEmail,
                action,
                entityType,
                entityId,
                oldValues ? JSON.stringify(oldValues) : null,
                newValues ? JSON.stringify(newValues) : null
            ]
        );
    } finally {
        await db.close();
    }
}

async function getAuditLogsCount({
    entityType = null,
    entityId = null,
    userId = null
}) {
    const db = await getDb();
    try {
        let query = 'SELECT COUNT(*) as count FROM audit_logs WHERE 1=1';
        const params = [];

        if (entityType) {
            query += ' AND entity_type = ?';
            params.push(entityType);
        }

        if (entityId) {
            query += ' AND entity_id = ?';
            params.push(entityId);
        }

        if (userId) {
            query += ' AND user_id = ?';
            params.push(userId);
        }

        const result = await db.get(query, params);
        return result.count;
    } finally {
        await db.close();
    }
}

async function getAuditLogs({
    entityType = null,
    entityId = null,
    userId = null,
    startDate = null,
    endDate = null,
    limit = 100,
    offset = 0
}) {
    const db = await getDb();
    try {
        let query = 'SELECT * FROM audit_logs WHERE 1=1';
        const params = [];

        if (entityType) {
            query += ' AND entity_type = ?';
            params.push(entityType);
        }

        if (entityId) {
            query += ' AND entity_id = ?';
            params.push(entityId);
        }

        if (userId) {
            query += ' AND user_id = ?';
            params.push(userId);
        }

        if (startDate) {
            query += ' AND timestamp >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND timestamp <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        return await db.all(query, params);
    } finally {
        await db.close();
    }
}

export {
    getDb,
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
    createMessageOfTheDay,
    getMessageOfTheDay,
    getLatestMessageOfTheDay,
    getAllMessagesOfTheDay,
    updateMessageOfTheDay,
    deleteMessageOfTheDay,
    createAuditLog,
    getAuditLogs,
    getAuditLogsCount
};