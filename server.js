import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increase limit for large DB

// Paths
const DB_PATH = path.join(__dirname, 'public', 'data', 'nikke_db.json');
const BUILDS_DIR = path.join(__dirname, 'public', 'data', 'builds');
const BURST_DB_PATH = path.join(__dirname, 'src', 'data', 'burst_db.ts');
const BUILDS_DB_PATH = path.join(__dirname, 'src', 'data', 'nikke_builds_db.ts');
const BACKUP_DIR = path.join(__dirname, 'backups');
const TAMPERMONKEY_DATA_DIR = path.join(__dirname, 'Tampermonkey Script', 'DATA');

// Ensure directories exist
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Atomic Write Helper
const atomicWriteFile = (filePath, content, callback) => {
    const tempPath = `${filePath}.tmp`;
    fs.writeFile(tempPath, content, (err) => {
        if (err) return callback(err);
        fs.rename(tempPath, filePath, (err) => {
            callback(err);
        });
    });
};

// --- Helper Functions ---

const generateBuildTS = (builds) => `
export interface OverloadOption {
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

export let NIKKE_BUILDS_DB: Record<string, NikkeBuild> = ${JSON.stringify(builds, null, 4)};

export const setNikkeBuildsDB = (data: Record<string, NikkeBuild>) => {
    NIKKE_BUILDS_DB = data;
};

export const getNikkeBuild = (name: string): NikkeBuild | null => {
    const cleanName = name.split('(')[0].trim();
    return NIKKE_BUILDS_DB[cleanName] || NIKKE_BUILDS_DB[name] || null;
};
`;

const generateBurstTS = (bursts) => `
export type RLStage = "2RL" | "2_5RL" | "3RL" | "3_5RL" | "4RL";

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

export let BURST_DB: Record<string, NikkeBurst> = ${JSON.stringify(bursts, null, 4)};

export const getBurstDB = () => BURST_DB;

export const setBurstDB = (data: Record<string, NikkeBurst>) => {
    BURST_DB = data;
};

export const getNikkeBurstValue = (name: string): NikkeBurst | null => {
    const cleanName = name.split('(')[0].trim();
    return BURST_DB[cleanName] || BURST_DB[name] || null;
};
`;

const normalizeName = (name) => {
    if (!name) return "";
    return name
        .replace(/[\(（][^)）]*[\)）]/g, "") // 괄호 제거
        .replace(/[^가-힣a-zA-Z0-9]/g, "")    // 특수문자/공백 제거
        .replace(/져/g, "저")                // 져 -> 저 (솔져 -> 솔저)
        .toLowerCase()
        .trim();
};

const updateNikkeFromRawData = (nikke, rawData) => {
    if (!nikke.build) nikke.build = {};

    // Update stats
    nikke.build.stats = {
        hp: rawData.stats.hp,
        atk: rawData.stats.atk,
        def: rawData.stats.def
    };

    // Update skills
    if (rawData.skills) {
        nikke.build.skills = rawData.skills;
    }

    // Update cube
    if (rawData.cube) {
        nikke.build.cube_level = rawData.cube.level;
    }

    // Update collection
    if (rawData.collection) {
        nikke.build.collection = {
            grade: rawData.collection.rarity,
            skill1: rawData.collection.skillLv1,
            skill2: rawData.collection.skillLv2
        };
    }

    // Update overload
    if (rawData.equipment) {
        if (!nikke.build.overload) nikke.build.overload = {};
        const parts = ['helmet', 'armor', 'gloves', 'boots'];

        rawData.equipment.forEach(eq => {
            const partIndex = eq.partIndex - 1;
            const partName = parts[partIndex];
            if (partName) {
                const options = {};
                if (eq.options && Array.isArray(eq.options)) {
                    eq.options.forEach((opt, idx) => {
                        options[`option${idx + 1}`] = {
                            type: opt.name,
                            stage: parseInt(opt.value.replace(/[^0-9]/g, '')) || 0
                        };
                    });
                }
                nikke.build.overload[partName] = options;
            }
        });
    }
};

// --- Routes ---
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
        }
    }

    // 2. Save New Data Atomically
    atomicWriteFile(DB_PATH, JSON.stringify(newData, null, 2), (err) => {
        if (err) {
            console.error('[Save] Failed:', err);
            return res.status(500).json({ error: 'Failed to write DB' });
        }
        console.log('[Save] Database updated successfully');
        res.json({ success: true });
    });
});

// 6. SAVE ALL (Consolidated)
app.post('/api/save-all', (req, res) => {
    const { db, builds, bursts } = req.body;

    if (!db) return res.status(400).json({ error: 'Main DB data is missing' });

    // *** BACKUP CREATION - Critical for data safety ***
    if (fs.existsSync(DB_PATH)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `nikke_db_${timestamp}.json`;
        const backupPath = path.join(BACKUP_DIR, backupName);
        try {
            fs.copyFileSync(DB_PATH, backupPath);
            console.log(`[Backup] Created: ${backupName}`);
        } catch (err) {
            console.error('[Backup] Failed:', err);
            // Continue with save even if backup fails, but log the error
        }
    }

    let pending = 0;
    let hasError = false;

    const checkDone = (err, type) => {
        if (hasError) return;
        if (err) {
            hasError = true;
            console.error(`[Save All] Failed to save ${type}:`, err);
            return res.status(500).json({ error: `Failed to save ${type}` });
        }
        pending--;
        if (pending === 0) {
            console.log('[Save All] All data saved successfully');
            res.json({ success: true });
        }
    };

    // 1. Save Main DB
    pending++;
    atomicWriteFile(DB_PATH, JSON.stringify(db, null, 2), (err) => checkDone(err, 'Main DB'));

    // 2. Save Builds (if provided)
    if (builds) {
        pending++;
        const buildContent = generateBuildTS(builds);
        atomicWriteFile(BUILDS_DB_PATH, buildContent, (err) => {
            const jsonPath = BUILDS_DB_PATH.replace('.ts', '.json');
            atomicWriteFile(jsonPath, JSON.stringify(builds, null, 4), (err2) => checkDone(err || err2, 'Builds DB'));
        });
    }

    // 3. Save Bursts (if provided)
    if (bursts) {
        pending++;
        const burstContent = generateBurstTS(bursts);
        atomicWriteFile(BURST_DB_PATH, burstContent, (err) => {
            const jsonPath = BURST_DB_PATH.replace('.ts', '.json');
            atomicWriteFile(jsonPath, JSON.stringify(bursts, null, 4), (err2) => checkDone(err || err2, 'Burst DB'));
        });
    }
});

// 3. SAVE BURST DB
app.post('/api/burst-db', (req, res) => {
    const newData = req.body;
    if (!newData) return res.status(400).json({ error: 'No data provided' });

    const fileContent = generateBurstTS(newData);

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

    const fileContent = generateBuildTS(newData);

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

// 6. GET Individual Nikke Build
app.get('/api/nikke/:id', (req, res) => {
    const id = req.params.id;
    const filePath = path.join(BUILDS_DIR, `${id}.json`);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Nikke build not found' });
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read build' });
        res.json(JSON.parse(data));
    });
});

// 7. SAVE Individual Nikke Build
app.post('/api/nikke/:id', (req, res) => {
    const id = req.params.id;
    const newData = req.body;
    const filePath = path.join(BUILDS_DIR, `${id}.json`);

    // 1. Save individual file
    fs.writeFile(filePath, JSON.stringify(newData, null, 2), (err) => {
        if (err) return res.status(500).json({ error: 'Failed to save build' });

        // 2. Sync with main DB metadata
        fs.readFile(DB_PATH, 'utf8', (err2, dbData) => {
            if (err2) {
                console.error('[Sync] Failed to read main DB');
                return res.json({ success: true, warning: 'Build saved but sync failed' });
            }

            try {
                const db = JSON.parse(dbData);
                const index = db.nikkes.findIndex(n => n.id === id);

                if (index !== -1) {
                    // Update only metadata that should be in main DB
                    const { build, ...metadata } = newData;
                    db.nikkes[index] = {
                        ...db.nikkes[index],
                        ...metadata,
                        build: build // Keep build in main DB too for search/filtering if needed
                    };
                    db.meta.last_updated = new Date().toISOString();

                    fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), (err3) => {
                        if (err3) console.error('[Sync] Failed to update main DB');
                        res.json({ success: true });
                    });
                } else {
                    res.json({ success: true, warning: 'Build saved but Nikke not found in main DB' });
                }
            } catch (e) {
                res.status(500).json({ error: 'Failed to parse main DB during sync' });
            }
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

// 8. Extractor Data Endpoints
app.get('/api/extractor/list', (req, res) => {
    if (!fs.existsSync(TAMPERMONKEY_DATA_DIR)) {
        return res.json([]);
    }
    fs.readdir(TAMPERMONKEY_DATA_DIR, (err, files) => {
        if (err) return res.status(500).json({ error: 'Failed to read directory' });
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        res.json(jsonFiles);
    });
});

// Run external merge tool
app.post('/api/extractor/batch-update', (req, res) => {
    console.log('[API] Starting batch update via merge tool...');
    exec('node tools/merge_tampermonkey_data.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`[API] Merge tool error: ${error.message}`);
            return res.status(500).json({ success: false, error: error.message });
        }
        console.log(`[API] Merge tool output: ${stdout}`);
        res.json({ success: true, message: 'Batch update completed.', output: stdout });
    });
});

// Run external merge tool for single Nikke
app.post('/api/extractor/sync-nikke', (req, res) => {
    const { filename, name, id } = req.body;
    let targetFile = filename;

    // Try to find the file if only name or id is provided
    if (!targetFile && (name || id)) {
        const files = fs.readdirSync(TAMPERMONKEY_DATA_DIR).filter(f => f.endsWith('.json'));
        if (id) {
            targetFile = files.find(f => f.includes(`(${id})`));
        }
        if (!targetFile && name) {
            targetFile = files.find(f => f.startsWith(name));
        }
    }

    if (!targetFile) {
        return res.status(404).json({ success: false, error: 'Matching JSON file not found in DATA directory.' });
    }

    console.log(`[API] Starting sync for ${targetFile}...`);
    exec(`node tools/merge_tampermonkey_data.js "${targetFile}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`[API] Sync error: ${error.message}`);
            return res.status(500).json({ success: false, error: error.message });
        }
        console.log(`[API] Sync tool output: ${stdout}`);
        res.json({ success: true, message: `Sync for ${targetFile} completed.`, output: stdout });
    });
});

app.get('/api/extractor/data/:filename', (req, res) => {
    const filename = req.params.filename;
    // Security check: ensure no directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ error: 'Invalid filename' });
    }
    const filePath = path.join(TAMPERMONKEY_DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read file' });
        try {
            res.json(JSON.parse(data));
        } catch (e) {
            res.status(500).json({ error: 'Invalid JSON in file' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`DB Path: ${DB_PATH}`);
}).on('error', (err) => {
    console.error('Failed to start server:', err);
});
