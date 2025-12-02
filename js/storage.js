// Système de sauvegarde avec localStorage
export class StorageManager {
    constructor() {
        this.storageKey = 'combat_game_save';
    }

    save(gameData) {
        try {
            const saveData = {
                version: '1.0',
                timestamp: Date.now(),
                currentLevel: gameData.currentLevel,
                progression: gameData.progression,
                settings: gameData.settings || {}
            };

            localStorage.setItem(this.storageKey, JSON.stringify(saveData));
            return true;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            return false;
        }
    }

    load() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (!savedData) return null;

            const data = JSON.parse(savedData);

            // Vérifier la version
            if (data.version !== '1.0') {
                console.warn('Version de sauvegarde incompatible');
                return null;
            }

            return data;
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            return null;
        }
    }

    hasSave() {
        return localStorage.getItem(this.storageKey) !== null;
    }

    delete() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            return false;
        }
    }

    // Sauvegarder les paramètres
    saveSettings(settings) {
        try {
            const currentSave = this.load() || {};
            currentSave.settings = settings;
            localStorage.setItem(this.storageKey, JSON.stringify(currentSave));
            return true;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des paramètres:', error);
            return false;
        }
    }

    // Charger les paramètres
    loadSettings() {
        const saveData = this.load();
        return saveData?.settings || {
            soundEnabled: true,
            musicEnabled: true,
            difficulty: 'normal'
        };
    }
}
