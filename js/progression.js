// Système de progression et de score
import { CONFIG } from './config.js';

export class ProgressionSystem {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.experience = 0;
        this.experienceToNextLevel = CONFIG.PROGRESSION.BASE_XP;
        this.achievements = new Set();
        this.stats = {
            totalDamageDealt: 0,
            totalDamageTaken: 0,
            enemiesDefeated: 0,
            attacksLanded: 0,
            attacksMissed: 0,
            combosPerformed: 0,
            maxCombo: 0,
            abilitiesUsed: 0,
            perfectLevels: 0
        };
    }

    addScore(points, multiplier = 1) {
        const finalPoints = Math.floor(points * multiplier);
        this.score += finalPoints;
        return finalPoints;
    }

    addExperience(amount) {
        this.experience += amount;

        let levelsGained = 0;
        while (this.experience >= this.experienceToNextLevel) {
            this.experience -= this.experienceToNextLevel;
            this.level++;
            levelsGained++;
            this.experienceToNextLevel = Math.floor(
                CONFIG.PROGRESSION.BASE_XP * Math.pow(CONFIG.PROGRESSION.XP_MULTIPLIER, this.level - 1)
            );
        }

        return levelsGained;
    }

    recordHit(damage, isCombo = false) {
        this.stats.attacksLanded++;
        this.stats.totalDamageDealt += damage;

        if (isCombo) {
            this.stats.combosPerformed++;
        }

        // Ajouter du score
        let scoreMultiplier = 1;
        if (isCombo) {
            scoreMultiplier = CONFIG.PROGRESSION.SCORE_COMBO_MULTIPLIER;
        }

        return this.addScore(CONFIG.PROGRESSION.SCORE_PER_HIT, scoreMultiplier);
    }

    recordMiss() {
        this.stats.attacksMissed++;
    }

    recordDamageTaken(damage) {
        this.stats.totalDamageTaken += damage;
    }

    recordEnemyDefeated(enemyLevel, damageTaken = 0) {
        this.stats.enemiesDefeated++;

        // Bonus pour niveau parfait (sans dégâts)
        if (damageTaken === 0) {
            this.stats.perfectLevels++;
            this.addScore(CONFIG.PROGRESSION.SCORE_PERFECT_BONUS);
        }

        // Ajouter de l'expérience
        const xpGained = CONFIG.PROGRESSION.BASE_XP * enemyLevel;
        const levelsGained = this.addExperience(xpGained);

        // Vérifier les achievements
        this.checkAchievements();

        return { xpGained, levelsGained };
    }

    recordCombo(comboCount) {
        this.stats.maxCombo = Math.max(this.stats.maxCombo, comboCount);
    }

    recordAbilityUsed() {
        this.stats.abilitiesUsed++;
    }

    checkAchievements() {
        const newAchievements = [];

        // Achievement: Premier sang
        if (this.stats.enemiesDefeated === 1 && !this.achievements.has('first_blood')) {
            this.achievements.add('first_blood');
            newAchievements.push({
                id: 'first_blood',
                name: 'Premier Sang',
                description: 'Vaincre votre premier ennemi'
            });
        }

        // Achievement: Combo Master
        if (this.stats.maxCombo >= 10 && !this.achievements.has('combo_master')) {
            this.achievements.add('combo_master');
            newAchievements.push({
                id: 'combo_master',
                name: 'Maître du Combo',
                description: 'Réaliser un combo de 10 coups'
            });
        }


        // Achievement: Perfectionniste
        if (this.stats.perfectLevels >= 3 && !this.achievements.has('perfectionist')) {
            this.achievements.add('perfectionist');
            newAchievements.push({
                id: 'perfectionist',
                name: 'Perfectionniste',
                description: 'Terminer 3 niveaux sans prendre de dégâts'
            });
        }

        // Achievement: Survivant
        if (this.stats.enemiesDefeated >= 5 && !this.achievements.has('survivor')) {
            this.achievements.add('survivor');
            newAchievements.push({
                id: 'survivor',
                name: 'Survivant',
                description: 'Vaincre 5 ennemis'
            });
        }

        // Achievement: Champion
        if (this.stats.enemiesDefeated >= 10 && !this.achievements.has('champion')) {
            this.achievements.add('champion');
            newAchievements.push({
                id: 'champion',
                name: 'Champion',
                description: 'Vaincre tous les ennemis'
            });
        }

        // Achievement: Précision Mortelle
        const accuracy = this.getAccuracy();
        if (accuracy >= 90 && this.stats.attacksLanded >= 20 && !this.achievements.has('deadly_precision')) {
            this.achievements.add('deadly_precision');
            newAchievements.push({
                id: 'deadly_precision',
                name: 'Précision Mortelle',
                description: 'Maintenir 90% de précision sur 20 attaques'
            });
        }

        return newAchievements;
    }

    getAccuracy() {
        const totalAttacks = this.stats.attacksLanded + this.stats.attacksMissed;
        if (totalAttacks === 0) return 0;
        return (this.stats.attacksLanded / totalAttacks) * 100;
    }

    getExperiencePercentage() {
        return (this.experience / this.experienceToNextLevel) * 100;
    }

    getSaveData() {
        return {
            score: this.score,
            level: this.level,
            experience: this.experience,
            experienceToNextLevel: this.experienceToNextLevel,
            achievements: Array.from(this.achievements),
            stats: { ...this.stats }
        };
    }

    loadSaveData(data) {
        if (!data) return false;

        this.score = data.score || 0;
        this.level = data.level || 1;
        this.experience = data.experience || 0;
        this.experienceToNextLevel = data.experienceToNextLevel || CONFIG.PROGRESSION.BASE_XP;
        this.achievements = new Set(data.achievements || []);
        this.stats = { ...this.stats, ...data.stats };

        return true;
    }

    reset() {
        this.score = 0;
        this.level = 1;
        this.experience = 0;
        this.experienceToNextLevel = CONFIG.PROGRESSION.BASE_XP;
        this.achievements.clear();
        this.stats = {
            totalDamageDealt: 0,
            totalDamageTaken: 0,
            enemiesDefeated: 0,
            attacksLanded: 0,
            attacksMissed: 0,
            combosPerformed: 0,
            maxCombo: 0,
            abilitiesUsed: 0,
            perfectLevels: 0
        };
    }
}

