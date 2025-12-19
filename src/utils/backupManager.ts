import type { NikkeData } from '../data/nikkes';

const AUTO_BACKUP_KEY = 'nikke_db_auto_backup';
const BACKUP_HISTORY_KEY = 'nikke_db_backup_history';
const SETTINGS_KEY = 'nikke_backup_settings';

export interface BackupSettings {
    intervalDays: number; // 0 for off, 1, 3, 7, 30
    lastBackupTime: number;
}

export interface BackupItem {
    id: string;
    timestamp: number;
    data: NikkeData[];
    count: number;
    type: 'auto' | 'manual';
}

export const getBackupSettings = (): BackupSettings => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) return JSON.parse(saved);
    return { intervalDays: 3, lastBackupTime: Date.now() };
};

export const saveBackupSettings = (settings: BackupSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getBackupHistory = (): BackupItem[] => {
    const saved = localStorage.getItem(BACKUP_HISTORY_KEY);
    if (saved) return JSON.parse(saved);
    return [];
};

export const createBackup = (data: NikkeData[], type: 'auto' | 'manual' = 'manual'): BackupItem => {
    const history = getBackupHistory();
    const newItem: BackupItem = {
        id: `backup_${Date.now()}`,
        timestamp: Date.now(),
        data: [...data],
        count: data.length,
        type
    };

    // Keep last 10 backups
    const newHistory = [newItem, ...history].slice(0, 10);
    localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(newHistory));

    if (type === 'auto') {
        const settings = getBackupSettings();
        saveBackupSettings({ ...settings, lastBackupTime: Date.now() });
    }

    return newItem;
};

export const checkAndRunAutoBackup = (data: NikkeData[]) => {
    const settings = getBackupSettings();
    if (settings.intervalDays <= 0) return;

    const now = Date.now();
    const diffDays = (now - settings.lastBackupTime) / (1000 * 60 * 60 * 24);

    if (diffDays >= settings.intervalDays) {
        console.log(`Running auto backup (Interval: ${settings.intervalDays} days)`);
        createBackup(data, 'auto');
    }
};

export const deleteBackup = (id: string) => {
    const history = getBackupHistory();
    const newHistory = history.filter(h => h.id !== id);
    localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(newHistory));
};
