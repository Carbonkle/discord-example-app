import Database from 'better-sqlite3';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'database.sqlite'));

// Create tables if they don't exist
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        hp INTEGER DEFAULT 20,
        mana INTEGER DEFAULT 10,
        armor INTEGER DEFAULT 0,
        speed INTEGER DEFAULT 10
    );
`);

export function createUser(userId) {
    const hp = Math.floor(20 + (Math.random() * 4 - 2));
    const mana = Math.floor(10 + (Math.random() * 4 - 2));
    const armor = 0;
    const speed = 10;
    
    db.prepare('INSERT INTO users (id, hp, mana, armor, speed) VALUES (?, ?, ?, ?, ?)').run(userId, hp, mana, armor, speed);
}

export default db;
