// Moteur de jeu principal
import { CONFIG, GAME_STATES } from './config.js';
import { Hero, Enemy } from './entities.js';
import { CombatSystem, ComboManager } from './combat.js';
import { ParticleSystem } from './particles.js';
import { UIManager } from './ui.js';
import { ProgressionSystem } from './progression.js';
import { StorageManager } from './storage.js';
import { MenuManager } from './menu.js';

export class Game {
    constructor() {
        this.state = GAME_STATES.MENU;
        this.currentLevel = 0;
        this.hero = null;
        this.enemy = null;
        this.playersData = null;
        this.enemiesData = null;

        // Systèmes
        this.combat = new CombatSystem();
        this.comboManager = new ComboManager();
        this.particles = null;
        this.ui = new UIManager();
        this.progression = new ProgressionSystem();
        this.storage = new StorageManager();
        this.menu = new MenuManager(
            () => this.startNewGame(),
            () => this.continueGame(),
            () => this.restartGame(),
            () => this.quitToMenu()
        );

        // Contrôles
        this.keys = {};
        this.lastFrameTime = 0;
        this.animationFrameId = null;

        // État du niveau
        this.levelStartDamageTaken = 0;
        this.isPaused = false;
    }

    async init() {
        try {
            // Charger les données JSON
            const [playersResponse, enemiesResponse] = await Promise.all([
                fetch('./json_file/players.json'),
                fetch('./json_file/enemies.json')
            ]);

            this.playersData = await playersResponse.json();
            this.enemiesData = await enemiesResponse.json();

            // Initialiser le système de particules
            const gameElement = document.querySelector('.jeu');
            this.particles = new ParticleSystem(gameElement);

            // Configurer les contrôles
            this.setupControls();

            // Afficher le menu principal
            const hasSave = this.storage.hasSave();
            this.menu.showMainMenu(hasSave);

        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
            alert('Erreur lors du chargement du jeu. Veuillez rafraîchir la page.');
        }
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            // Pause
            if (e.code === CONFIG.KEYS.PAUSE && this.state === GAME_STATES.PLAYING) {
                this.togglePause();
            }

            // Empêcher le défilement avec les flèches
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    startNewGame() {
        this.currentLevel = 0;
        this.progression.reset();
        this.storage.delete();
        this.startLevel(0);
    }

    continueGame() {
        const saveData = this.storage.load();
        if (saveData) {
            this.currentLevel = saveData.currentLevel || 0;
            this.progression.loadSaveData(saveData.progression);
            this.startLevel(this.currentLevel);
        } else {
            this.startNewGame();
        }
    }

    restartGame() {
        this.cleanup();
        this.startNewGame();
    }

    quitToMenu() {
        this.cleanup();
        this.state = GAME_STATES.MENU;
        this.menu.showMainMenu(this.storage.hasSave());
    }

    async startLevel(levelIndex) {
        this.currentLevel = levelIndex;
        this.state = GAME_STATES.LEVEL_TRANSITION;

        // Vérifier si on a terminé tous les niveaux
        if (levelIndex >= this.enemiesData.length) {
            this.showVictory();
            return;
        }

        // Nettoyer le niveau précédent
        this.cleanup();

        // Afficher l'écran de début de niveau
        const enemyData = this.enemiesData[levelIndex];
        await this.menu.showLevelStart(levelIndex + 1, enemyData.name);

        // Initialiser le niveau
        this.initLevel(levelIndex);

        // Démarrer la boucle de jeu
        this.state = GAME_STATES.PLAYING;
        this.lastFrameTime = performance.now();
        this.gameLoop();
    }

    initLevel(levelIndex) {
        const heroElement = document.querySelector('.hero');
        const enemyElement = document.querySelector('.enemy');

        // Créer le héros
        const heroData = this.playersData[0];
        this.hero = new Hero(heroData, heroElement);

        // Créer l'ennemi
        const enemyData = this.enemiesData[levelIndex];
        this.enemy = new Enemy(enemyData, enemyElement);

        // Positionner les personnages
        this.hero.updatePosition(0, 0);
        this.enemy.updatePosition(CONFIG.GAME.WIDTH - CONFIG.ENEMY.WIDTH, 0);

        // Mettre à jour l'UI
        this.ui.updateNames(this.hero.name, this.enemy.name);
        this.ui.updateHealthBar(this.hero, 'left');
        this.ui.updateHealthBar(this.enemy, 'right');
        this.ui.updateScore(this.progression.score);
        this.ui.updateCombo(0);

        // Réinitialiser le combo manager
        this.comboManager.reset();

        // Enregistrer les dégâts au début du niveau
        this.levelStartDamageTaken = this.progression.stats.totalDamageTaken;
    }

    gameLoop(currentTime = 0) {
        if (this.state !== GAME_STATES.PLAYING || this.isPaused) {
            if (this.state === GAME_STATES.PLAYING && this.isPaused) {
                this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
            }
            return;
        }

        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        // Mettre à jour le jeu
        this.update(deltaTime);

        // Continuer la boucle
        this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        if (!this.hero || !this.enemy) return;

        // Mettre à jour les cooldowns du héros
        this.hero.updateCooldowns(deltaTime);

        // Mettre à jour l'UI des capacités
        for (const [name, ability] of Object.entries(this.hero.abilities)) {
            const config = CONFIG.ABILITIES[name.toUpperCase()];
            if (config) {
                this.ui.updateAbilityCooldown(name, ability.cooldown, config.cooldown);
            }
        }

        // Gérer les inputs
        this.handleInput();

        // Mettre à jour l'IA de l'ennemi
        if (this.enemy.isAlive) {
            this.enemy.updateAI(deltaTime, this.hero.position);

            // L'ennemi attaque
            if (this.enemy.shouldAttack(Date.now())) {
                this.enemyAttack();
            }
        }

        // Mettre à jour les projectiles
        this.combat.updateProjectiles(deltaTime, (projectile) => {
            this.onProjectileHit(projectile);
        });

        // Mettre à jour les particules
        this.particles.update(deltaTime);

        // Vérifier la fin du niveau
        this.checkLevelEnd();
    }

    handleInput() {
        if (!this.hero || !this.hero.isAlive) return;

        // Déplacements
        if (this.keys[CONFIG.KEYS.MOVE_LEFT]) {
            this.hero.move('left');
        }
        if (this.keys[CONFIG.KEYS.MOVE_RIGHT]) {
            this.hero.move('right');
        }

        // Saut / Esquive
        if (this.keys[CONFIG.KEYS.JUMP]) {
            this.keys[CONFIG.KEYS.JUMP] = false; // Empêcher le spam
            const dodged = this.hero.dodge();
            if (dodged) {
                this.ui.showNotification('Esquive!', 'info');
            }
        }

        // Attaque
        if (this.keys[CONFIG.KEYS.ATTACK] && !this.hero.isAttacking) {
            this.keys[CONFIG.KEYS.ATTACK] = false; // Empêcher le spam
            this.heroAttack();
        }

        // Capacités spéciales
        if (this.keys[CONFIG.KEYS.ABILITY_1]) {
            this.keys[CONFIG.KEYS.ABILITY_1] = false;
            this.useAbility('fireball');
        }
        if (this.keys[CONFIG.KEYS.ABILITY_2]) {
            this.keys[CONFIG.KEYS.ABILITY_2] = false;
            this.useAbility('lightning');
        }
        if (this.keys[CONFIG.KEYS.ABILITY_3]) {
            this.keys[CONFIG.KEYS.ABILITY_3] = false;
            this.useAbility('heal');
        }
    }

    heroAttack() {
        const attackResult = this.hero.attack();
        if (!attackResult) return;

        // Créer un projectile
        const heroPos = {
            x: this.hero.position.x + CONFIG.PLAYER.WIDTH,
            y: this.hero.position.y + CONFIG.PLAYER.HEIGHT / 2
        };
        const enemyPos = {
            x: this.enemy.position.x,
            y: this.enemy.position.y + CONFIG.ENEMY.HEIGHT / 2
        };

        this.combat.createProjectile(heroPos, enemyPos, attackResult.damage, 'fire');

        // Ajouter l'animation de feu
        const feu = document.querySelector('.feu');
        feu.classList.add('animationfeu');
        setTimeout(() => {
            feu.classList.remove('animationfeu');
        }, CONFIG.ANIMATIONS.ATTACK_DURATION);
    }

    enemyAttack() {
        const attackResult = this.enemy.attack();
        if (!attackResult) return;

        // Créer un projectile
        const enemyPos = {
            x: this.enemy.position.x,
            y: this.enemy.position.y + CONFIG.ENEMY.HEIGHT / 2
        };
        const heroPos = {
            x: this.hero.position.x + CONFIG.PLAYER.WIDTH,
            y: this.hero.position.y + CONFIG.PLAYER.HEIGHT / 2
        };

        this.combat.createProjectile(enemyPos, heroPos, attackResult.damage, 'enemy');

        // Ajouter l'animation de feu ennemi
        const feuE = document.querySelector('.feuE');
        feuE.classList.add('animationfeuE');
        setTimeout(() => {
            feuE.classList.remove('animationfeuE');
        }, CONFIG.ANIMATIONS.ATTACK_DURATION * 1.5);
    }

    onProjectileHit(projectile) {
        const isHeroProjectile = projectile.type === 'fire';
        const attacker = isHeroProjectile ? this.hero : this.enemy;
        const defender = isHeroProjectile ? this.enemy : this.hero;

        if (!defender.isAlive) return;

        // Si le héros est en train de sauter (esquive), il ne prend pas de dégâts
        if (!isHeroProjectile && !this.hero.canDodge) {
            // Le héros est en train d'esquiver
            this.ui.showNotification('Attaque esquivée!', 'success');
            this.progression.recordMiss(); // Compter comme une attaque manquée pour l'ennemi
            return;
        }

        // Calculer si l'attaque touche
        const hitResult = this.combat.calculateHit(attacker, defender, true);

        if (hitResult.dodged) {
            // Animation d'esquive
            defender.element.classList.add('sautEnemy');
            setTimeout(() => {
                defender.element.classList.remove('sautEnemy');
            }, 500);

            if (isHeroProjectile) {
                this.progression.recordMiss();
            }
            return;
        }

        // Appliquer les dégâts
        const isCombo = isHeroProjectile && this.hero.comboCount >= CONFIG.PLAYER.COMBO_THRESHOLD;
        const damageResult = this.combat.applyDamage(
            attacker,
            defender,
            projectile.damage,
            hitResult.critical,
            isCombo
        );

        // Effets visuels
        const defenderPos = {
            x: defender.position.x + (isHeroProjectile ? CONFIG.ENEMY.WIDTH : CONFIG.PLAYER.WIDTH) / 2,
            y: defender.position.y + (isHeroProjectile ? CONFIG.ENEMY.HEIGHT : CONFIG.PLAYER.HEIGHT) / 2
        };

        if (isCombo) {
            this.particles.createComboEffect(defenderPos.x, defenderPos.y);
            this.particles.createComboText(defenderPos.x, defenderPos.y, this.hero.comboCount);
        } else {
            this.particles.createHitEffect(defenderPos.x, defenderPos.y);
        }

        this.particles.createDamageText(
            defenderPos.x,
            defenderPos.y,
            damageResult.damage,
            damageResult.isCritical,
            damageResult.isCombo
        );

        // Secouer l'écran
        this.combat.screenShake(damageResult.isCritical ? 15 : 10);

        // Mettre à jour l'UI
        this.ui.updateHealthBar(defender, isHeroProjectile ? 'right' : 'left');

        // Enregistrer les statistiques
        if (isHeroProjectile) {
            const scoreGained = this.progression.recordHit(damageResult.damage, isCombo);
            this.ui.updateScore(this.progression.score);

            const comboCount = this.comboManager.addHit();
            this.progression.recordCombo(comboCount);
            this.ui.updateCombo(this.hero.comboCount);
        } else {
            this.progression.recordDamageTaken(damageResult.damage);
        }

        // Vérifier si le défenseur est mort
        if (damageResult.killed) {
            if (isHeroProjectile) {
                this.onEnemyDefeated();
            } else {
                this.onHeroDefeated();
            }
        }
    }

    useAbility(abilityName) {
        const result = this.hero.useAbility(abilityName);
        if (!result) {
            this.ui.showNotification('Capacité en cooldown!', 'warning');
            return;
        }

        this.progression.recordAbilityUsed();
        this.ui.showNotification(`${result.name} utilisé!`, 'success');

        if (result.heal > 0) {
            // Soin
            const healed = this.hero.heal(result.heal);
            this.ui.updateHealthBar(this.hero, 'left');
            this.particles.createDamageText(
                this.hero.position.x + CONFIG.PLAYER.WIDTH / 2,
                this.hero.position.y + CONFIG.PLAYER.HEIGHT,
                healed,
                false,
                false
            );
        } else if (result.damage > 0) {
            // Attaque spéciale
            const heroPos = {
                x: this.hero.position.x + CONFIG.PLAYER.WIDTH,
                y: this.hero.position.y + CONFIG.PLAYER.HEIGHT / 2
            };
            const enemyPos = {
                x: this.enemy.position.x,
                y: this.enemy.position.y + CONFIG.ENEMY.HEIGHT / 2
            };

            this.combat.createProjectile(heroPos, enemyPos, result.damage, 'fire');
        }
    }

    onEnemyDefeated() {
        const damageTakenThisLevel = this.progression.stats.totalDamageTaken - this.levelStartDamageTaken;
        const result = this.progression.recordEnemyDefeated(this.currentLevel + 1, damageTakenThisLevel);

        // Effets de victoire
        const enemyPos = {
            x: this.enemy.position.x + CONFIG.ENEMY.WIDTH / 2,
            y: this.enemy.position.y + CONFIG.ENEMY.HEIGHT / 2
        };
        this.particles.createVictoryEffect(enemyPos.x, enemyPos.y);

        // Vérifier les nouveaux achievements
        const newAchievements = this.progression.checkAchievements();
        newAchievements.forEach(ach => {
            this.ui.showNotification(`Achievement débloqué: ${ach.name}!`, 'success');
        });

        if (result.levelsGained > 0) {
            this.ui.showNotification(`Niveau ${this.progression.level} atteint!`, 'success');
        }

        // Sauvegarder la progression
        this.saveGame();

        // Passer au niveau suivant après un délai
        setTimeout(() => {
            this.startLevel(this.currentLevel + 1);
        }, 3000);
    }

    onHeroDefeated() {
        this.state = GAME_STATES.GAME_OVER;

        // Arrêter la boucle de jeu
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        // Afficher l'écran de game over
        setTimeout(() => {
            this.menu.showGameOverScreen({
                score: this.progression.score,
                level: this.currentLevel + 1,
                maxCombo: this.progression.stats.maxCombo
            });
        }, 2000);
    }

    showVictory() {
        this.state = GAME_STATES.VICTORY;

        const newAchievements = this.progression.checkAchievements();

        this.menu.showVictoryScreen({
            score: this.progression.score,
            enemiesDefeated: this.progression.stats.enemiesDefeated,
            maxCombo: this.progression.stats.maxCombo,
            accuracy: this.progression.getAccuracy(),
            newAchievements
        });

        // Supprimer la sauvegarde (jeu terminé)
        this.storage.delete();
    }

    checkLevelEnd() {
        // Cette fonction est appelée à chaque frame pour vérifier si le niveau est terminé
        // La logique est gérée dans onEnemyDefeated et onHeroDefeated
    }

    togglePause() {
        if (this.isPaused) {
            this.isPaused = false;
            this.ui.removePauseMenu();
            this.lastFrameTime = performance.now();
        } else {
            this.isPaused = true;
            const pauseScreen = this.ui.showPauseMenu();

            pauseScreen.querySelector('.btn-resume').addEventListener('click', () => {
                this.togglePause();
            });

            pauseScreen.querySelector('.btn-restart').addEventListener('click', () => {
                this.ui.removePauseMenu();
                this.restartGame();
            });

            pauseScreen.querySelector('.btn-menu').addEventListener('click', () => {
                this.ui.removePauseMenu();
                this.quitToMenu();
            });
        }
    }

    saveGame() {
        this.storage.save({
            currentLevel: this.currentLevel,
            progression: this.progression.getSaveData()
        });
    }

    cleanup() {
        // Arrêter la boucle de jeu
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Nettoyer les projectiles et particules
        this.combat.clearProjectiles();
        this.particles.clear();

        // Réinitialiser le combo
        this.comboManager.reset();

        // Nettoyer les animations
        const hero = document.querySelector('.hero');
        const enemy = document.querySelector('.enemy');
        const feu = document.querySelector('.feu');
        const feuE = document.querySelector('.feuE');

        if (hero) {
            hero.className = 'hero';
            hero.style.left = '0px';
        }
        if (enemy) {
            enemy.className = 'enemy';
            enemy.style.right = '0px';
        }
        if (feu) {
            feu.className = 'feu';
        }
        if (feuE) {
            feuE.className = 'feuE';
        }
    }
}
