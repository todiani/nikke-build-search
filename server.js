import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increase limit for large DB

// Paths
const DB_PATH = path.join(__dirname, 'public', 'data', 'nikke_db.json');
const BACKUP_DIR = path.join(__dirname, 'backups');

// Ensure backup dir exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// 1. GET DB
app.get('/api/db', (req, res) => {
    if (!fs.existsSync(DB_PATH)) {
        return res.status(404).json({ error: 'Database file not found' });
    }
    fs.readFile(DB_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read DB' });
        try {
            const json = JSON.parse(data);
            res.json(json);
        } catch (e) {
            res.status(500).json({ error: 'Invalid JSON in DB' });
        }
    });
});

// 2. SAVE DB (with Backup)
app.post('/api/db', (req, res) => {
    const newData = req.body;
    if (!newData) return res.status(400).json({ error: 'No data provided' });

    // 1. Create Backup
    if (fs.existsSync(DB_PATH)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `nikke_db_${timestamp}.json`;
        const backupPath = path.join(BACKUP_DIR, backupName);
        try {
            fs.copyFileSync(DB_PATH, backupPath);
            console.log(`[Backup] Created: ${backupName}`);
        } catch (err) {
            console.error('[Backup] Failed:', err);
            // Proceed to save anyway? Maybe warn.
        }
    }

    // 2. Save New Data
    fs.writeFile(DB_PATH, JSON.stringify(newData, null, 2), (err) => {
        if (err) {
            console.error('[Save] Failed:', err);
            return res.status(500).json({ error: 'Failed to write DB' });
        }
        console.log('[Save] Database updated successfully');
        res.json({ success: true });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`DB Path: ${DB_PATH}`);
});
