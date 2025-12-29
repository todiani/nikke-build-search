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
const BURST_DB_PATH = path.join(__dirname, 'src', 'data', 'burst_db.ts');
const BUILDS_DB_PATH = path.join(__dirname, 'src', 'data', 'nikke_builds_db.ts');
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

// 3. SAVE BURST DB
app.post('/api/burst-db', (req, res) => {
    const newData = req.body;
    if (!newData) return res.status(400).json({ error: 'No data provided' });

    const fileContent = `export type RLStage = "2RL" | "2_5RL" | "3RL" | "3_5RL" | "4RL";

export interface RLData {
    value: number;
    hits?: string;
    bonus?: string;
}

export interface NikkeBurst {
    "2RL": RLData;
    "2_5RL": RLData;
    "3RL": RLData;
    "3_5RL": RLData;
    "4RL": RLData;
}

export let BURST_DB: Record<string, NikkeBurst> = ${JSON.stringify(newData, null, 4)};

export const setBurstDB = (data: Record<string, NikkeBurst>) => {
    BURST_DB = data;
};

export const getNikkeBurstValue = (name: string): NikkeBurst | null => {
    const cleanName = name.split('(')[0].trim();
    return BURST_DB[cleanName] || BURST_DB[name] || null;
};
`;

    fs.writeFile(BURST_DB_PATH, fileContent, (err) => {
        if (err) {
            console.error('[Save Burst DB] Failed:', err);
            return res.status(500).json({ error: 'Failed to write Burst DB' });
        }
        
        // Also save as JSON for easier loading via API
        const jsonPath = BURST_DB_PATH.replace('.ts', '.json');
        fs.writeFile(jsonPath, JSON.stringify(newData, null, 4), (err2) => {
            if (err2) console.error('[Save Burst JSON] Failed:', err2);
            console.log('[Save Burst DB] Database updated successfully');
            res.json({ success: true });
        });
    });
});

// 4. GET BURST DB
app.get('/api/burst-db', (req, res) => {
    const jsonPath = BURST_DB_PATH.replace('.ts', '.json');
    if (fs.existsSync(jsonPath)) {
        fs.readFile(jsonPath, 'utf8', (err, data) => {
            if (err) return res.status(500).json({ error: 'Failed to read Burst JSON' });
            res.json(JSON.parse(data));
        });
    } else {
        res.json({});
    }
});

// 5. SAVE NIKKE BUILDS DB
app.post('/api/nikke-builds', (req, res) => {
    const newData = req.body;
    if (!newData) return res.status(400).json({ error: 'No data provided' });

    const fileContent = `export interface OverloadOption {
    type: string;
    stage: number;
}

export interface PartOptions {
    option1: OverloadOption;
    option2: OverloadOption;
    option3: OverloadOption;
}

export interface NikkeBuild {
    stats: {
        hp: number;
        atk: number;
        def: number;
    };
    skills: {
        skill1: number;
        skill2: number;
        burst: number;
    };
    cube_level: number;
    collection: {
        grade: string; // None, R, SR, SSR
        skill1: number;
        skill2: number;
    };
    overload: {
        helmet: PartOptions;
        armor: PartOptions;
        gloves: PartOptions;
        boots: PartOptions;
    };
}

export let NIKKE_BUILDS_DB: Record<string, NikkeBuild> = ${JSON.stringify(newData, null, 4)};

export const setNikkeBuildsDB = (data: Record<string, NikkeBuild>) => {
    NIKKE_BUILDS_DB = data;
};

export const getNikkeBuild = (name: string): NikkeBuild | null => {
    const cleanName = name.split('(')[0].trim();
    return NIKKE_BUILDS_DB[cleanName] || NIKKE_BUILDS_DB[name] || null;
};
`;

    fs.writeFile(BUILDS_DB_PATH, fileContent, (err) => {
        if (err) {
            console.error('[Save Builds DB] Failed:', err);
            return res.status(500).json({ error: 'Failed to write Builds DB' });
        }
        
        // Also save as JSON for easier reading
        const jsonPath = BUILDS_DB_PATH.replace('.ts', '.json');
        fs.writeFile(jsonPath, JSON.stringify(newData, null, 4), (err2) => {
            if (err2) console.error('[Save Builds JSON] Failed:', err2);
            console.log('[Save Builds DB] Database updated successfully');
            res.json({ success: true });
        });
    });
});

// 5. GET NIKKE BUILDS (Optional, but good for dynamic loading)
app.get('/api/nikke-builds', (req, res) => {
    if (!fs.existsSync(BUILDS_DB_PATH)) {
        return res.json({});
    }
    // We can't easily parse .ts on the fly without a parser, 
    // but we can extract the JSON part if we really wanted to.
    // However, since we are saving it, we can also save a .json version.
    const jsonPath = BUILDS_DB_PATH.replace('.ts', '.json');
    if (fs.existsSync(jsonPath)) {
        fs.readFile(jsonPath, 'utf8', (err, data) => {
            if (err) return res.status(500).json({ error: 'Failed to read Builds JSON' });
            res.json(JSON.parse(data));
        });
    } else {
        // Fallback or just return empty
        res.json({});
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`DB Path: ${DB_PATH}`);
});
