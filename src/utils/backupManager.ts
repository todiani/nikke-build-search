import type { NikkeData } from '../data/nikkes';
import { saveBackupSettingsToDB, saveBackupHistoryToDB, getBackupData } from './nikkeDataManager';

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
    const { settings } = getBackupData();
    if (settings) return settings;
    return { intervalDays: 3, lastBackupTime: Date.now() };
};

export const saveBackupSettings = async (settings: BackupSettings) => {
    await saveBackupSettingsToDB(settings);
};

export const getBackupHistory = (): BackupItem[] => {
    const { history } = getBackupData();
    return history || [];
};

export const createBackup = async (data: NikkeData[], type: 'auto' | 'manual' = 'manual'): Promise<BackupItem> => {
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
    await saveBackupHistoryToDB(newHistory);

    if (type === 'auto') {
        const settings = getBackupSettings();
        await saveBackupSettings({ ...settings, lastBackupTime: Date.now() });
    }

    return newItem;
};

export const checkAndRunAutoBackup = async (data: NikkeData[]) => {
    const settings = getBackupSettings();
    if (settings.intervalDays <= 0) return;

    const now = Date.now();
    const diffDays = (now - settings.lastBackupTime) / (1000 * 60 * 60 * 24);

    if (diffDays >= settings.intervalDays) {
        console.log(`Running auto backup (Interval: ${settings.intervalDays} days)`);
        await createBackup(data, 'auto');
    }
};

export const deleteBackup = async (id: string) => {
    const history = getBackupHistory();
    const newHistory = history.filter(h => h.id !== id);
    await saveBackupHistoryToDB(newHistory);
};
